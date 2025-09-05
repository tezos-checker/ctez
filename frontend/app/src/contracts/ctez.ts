import {
  OpKind,
  TransactionWalletOperation,
  WalletContract,
  WalletOperation,
  WalletParamsWithKind,
} from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import {
  AddLiquidityParams,
  AllOvenDatum,
  CollectFromLiquidityParams,
  CTezStorage,
  ctezToTezParams,
  Depositor,
  depositors,
  EditDepositorOps,
  ErrorType,
  HalfDex,
  HalfDexLQTData,
  Oven,
  OvenStorage,
  RemoveLiquidityParams,
  TezToCtezParams,
  TokenToTokenParams,
} from '../interfaces';
import { CTEZ_ADDRESS, CTEZ_CONTRACT_BIGMAP } from '../utils/globals';
import { logger } from '../utils/logger';
import { getLastOvenId, saveLastOven } from '../utils/ovenUtils';
import { getTezosInstance } from './client';
import { executeMethod, initContract } from './utils';
import { getAllOvensAPI, getOvenByAddressAPI, getUserOvensAPI } from '../api/tzkt';
import { getCTezFa12Contract } from './fa12';

let cTez: WalletContract;

export const initCTez = async (address: string): Promise<void> => {
  cTez = await initContract(address);
};

export const getCTez = (): WalletContract => {
  return cTez;
};

export const getCtezStorage = async (): Promise<CTezStorage> => {
  const storage = await cTez.storage<CTezStorage>();
  return storage;
};

export const getActualCtezStorage = async (): Promise<CTezStorage> => {
  const [storage, actualStorage] = await Promise.all([cTez.storage<CTezStorage>(), cTez.contractViews.get_current_state().executeView({ viewCaller: cTez.address })]);
  return {
    context: actualStorage.context,
    last_update: actualStorage.last_update,
    ovens: storage.ovens,
    sell_ctez: {
      ...actualStorage.sell_ctez,
      liquidity_owners: storage.sell_ctez.liquidity_owners
    },
    sell_tez: {
      ...actualStorage.sell_tez,
      liquidity_owners: storage.sell_tez.liquidity_owners
    }
  };
};

export const getOvenStorage = async (ovenAddress: string): Promise<OvenStorage> => {
  const ovenContract = await initContract(ovenAddress);
  const storage: OvenStorage = await ovenContract.storage();
  return storage;
};

export const getUserHalfDexLqtBalance = async (userAddress: string, ctezDex: boolean): Promise<HalfDexLQTData> => {
  const storage = await cTez.storage<CTezStorage>();
  const dex = ctezDex ? storage.sell_ctez : storage.sell_tez;
  const lqt = (await dex.liquidity_owners.get(userAddress))?.liquidity_shares ?? new BigNumber(0);
  const lqtShare = dex.total_liquidity_shares.isZero()
    ? new BigNumber(0)
    : (lqt.dividedBy(dex.total_liquidity_shares).multipliedBy(100));

  return { lqt, lqtShare }
}

const clampNat = (val: BigNumber): BigNumber => {
  return val.isPositive() ? val : new BigNumber(0);
};

const newtonStep = (x: BigNumber, y: BigNumber, q: BigNumber, Q: BigNumber): BigNumber => {
  /* Computes
      3 y⁴ + 6 y² (q - Q)² + 8 y³ (-q + Q) + 80 Q³ x 
      ---------------------------------------------------
      4 ((y - q)³ + 3 (y - q)² Q + 3 (y - q) Q² + 21 Q³)
  */
  const dq = BigNumber.min(y, q);
  const q_m_Q = q.minus(Q);
  const dq_m_q = dq.minus(q);
  const dq_m_q_sq = dq_m_q.multipliedBy(dq_m_q);
  const dq_m_q_cu = dq_m_q_sq.multipliedBy(dq_m_q);
  const Q_sq = Q.multipliedBy(Q);
  const Q_cu = Q_sq.multipliedBy(Q);
  const num = new BigNumber(3).multipliedBy(dq.pow(4))
    .plus(new BigNumber(6).multipliedBy(dq.pow(2)).multipliedBy(q_m_Q.pow(2)))
    .plus(new BigNumber(8).multipliedBy(dq.pow(3)).multipliedBy(-q_m_Q))
    .plus(new BigNumber(80).multipliedBy(Q_cu).multipliedBy(x));
  const denom = new BigNumber(4).multipliedBy(
    dq_m_q_cu.plus(new BigNumber(3).multipliedBy(dq_m_q_sq).multipliedBy(Q))
      .plus(new BigNumber(3).multipliedBy(dq_m_q).multipliedBy(Q_sq))
      .plus(new BigNumber(21).multipliedBy(Q_cu))
  );
  return num.dividedToIntegerBy(denom)
}

const getSwapAmountUsingExceedLiquidity = (x: BigNumber, q: BigNumber, Q: BigNumber): [BigNumber, BigNumber] => {
  const non_targeted_q = clampNat(q.minus(Q));
  const rest_x = clampNat(x.minus(non_targeted_q));
  const untaxed_y = BigNumber.min(x, non_targeted_q);
  return [rest_x, untaxed_y]
}

const getSwapAmountUsingIncentivizedLiquidity = (x: BigNumber, q: BigNumber, Q: BigNumber): BigNumber => {
  q = BigNumber.min(q, Q);
  let y = x;
  y = clampNat(newtonStep(x, y, q, Q));
  y = clampNat(newtonStep(x, y, q, Q));
  y = clampNat(newtonStep(x, y, q, Q));
  const result = y.minus(y.dividedToIntegerBy(1_000_000_000)).minus(1);
  return result.isPositive() ? result : new BigNumber(0);
};

export const calcSelfTokensToSell = (isSellCtezDex: boolean, storage: CTezStorage, proceedsAmountNat: BigNumber): number => {
  const dex = isSellCtezDex ? storage.sell_ctez : storage.sell_tez;
  const x = isSellCtezDex
    ? proceedsAmountNat.multipliedBy(2 ** 64).dividedToIntegerBy(storage.context.target)
    : proceedsAmountNat.multipliedBy(storage.context.target).dividedToIntegerBy(2 ** 64);

  const q = dex.self_reserves;
  const Q = isSellCtezDex
    /* eslint-disable */
    ? storage.context._Q
    /* eslint-disable */
    : BigNumber.max(storage.context._Q.multipliedBy(storage.context.target).dividedToIntegerBy(2 ** 64), 1);

  const [rest_x, y] = getSwapAmountUsingExceedLiquidity(x, q, Q);
  const result = rest_x.isZero()
    ? y
    : y.plus(getSwapAmountUsingIncentivizedLiquidity(rest_x, q, Q));

  return result.toNumber();
};

export const calcSelfTokensToSellOnchain = async (isSellCtezDex: boolean, proceedsAmount: BigNumber): Promise<number> => {
  try {
    const amount: BigNumber = await cTez.contractViews.calc_tokens_to_sell({ is_sell_ctez_dex: isSellCtezDex, proceeds_amount: proceedsAmount.toString(10) })
      .executeView({ viewCaller: cTez.address });
    return amount.toNumber();
  } catch {
    return 0;
  }
};

export const create = async (
  userAddress: string,
  bakerAddress: string,
  op: Depositor,
  lastOvenId: number,
  allowedDepositors?: string[],
  amount = 0,
): Promise<TransactionWalletOperation> => {
  const newOvenId = lastOvenId + 1;
  const operation = await executeMethod(
    cTez,
    'create_oven',
    [newOvenId, bakerAddress, op, allowedDepositors],
    undefined,
    amount,
  );
  saveLastOven(userAddress, cTez.address, newOvenId);
  return operation;
};

export const delegate = async (
  ovenAddress: string,
  bakerAddress: string,
): Promise<TransactionWalletOperation> => {
  const ovenContract = await initContract(ovenAddress);
  const operation = await executeMethod(ovenContract, 'delegate', [bakerAddress]);
  return operation;
};

const prepareOvenAllowAddressCall = (
  ovenContract: WalletContract,
  address: string,
  allow: boolean,
): WalletParamsWithKind => {
  return {
    kind: OpKind.TRANSACTION,
    ...ovenContract.methods.allow_account(allow, address).toTransferParams(),
  };
};

const prepareOvenAllowAnyCall = (
  ovenContract: WalletContract,
  allow: boolean,
): WalletParamsWithKind => {
  return {
    kind: OpKind.TRANSACTION,
    ...ovenContract.methods.allow_any(allow).toTransferParams(),
  };
};
const getWhiteList = (recvData: any) => {
  try {
    if (!recvData?.depositors?.whitelist)
      return [];
    const list = Array.prototype.slice.call(recvData.depositors.whitelist);
    return list;
  } catch (err) {
    console.log(err);
    return [];
  }
};
export const addRemoveDepositorList = async (
  ovenAddress: string,
  ovenStorage: OvenStorage,
  addList: string[] = [],
  disableList: string[] = [],
): Promise<any> => {
  const tezos = getTezosInstance();
  const ovenContract = await initContract(ovenAddress);
  const whitelist = getWhiteList(ovenStorage);
  const disableAny =
    !Array.isArray(ovenStorage?.depositors) && Object.keys(ovenStorage?.depositors).includes('any');
  const batchOps: WalletParamsWithKind[] = [];
  let prevAddresses: string[] = [];
  if (disableAny) {
    batchOps.push(prepareOvenAllowAnyCall(ovenContract, false));
  } else {
    prevAddresses = whitelist as string[];
  }
  const newAddresses = addList.filter((o) => !prevAddresses.includes(o));
  newAddresses.forEach((addr) => {
    batchOps.push(prepareOvenAllowAddressCall(ovenContract, addr, true));
  });
  disableList.forEach((addr) => {
    batchOps.push(prepareOvenAllowAddressCall(ovenContract, addr, false));
  });
  const batch = tezos.wallet.batch([...batchOps]);
  const hash = await batch.send();
  return hash.opHash;
};

export const enableDisableAnyDepositor = async (
  ovenAddress: string,
  allow: boolean,
): Promise<string> => {
  const tezos = getTezosInstance();
  const ovenContract = await initContract(ovenAddress);
  const batch = tezos.wallet.batch([prepareOvenAllowAnyCall(ovenContract, allow)]);
  const hash = await batch.send();
  return hash.opHash;
};

export const editDepositor = async (
  ovenAddress: string,
  ops: EditDepositorOps,
  enable: boolean,
  address?: string,
): Promise<TransactionWalletOperation> => {
  const ovenContract = await initContract(ovenAddress);
  const operation = await executeMethod(ovenContract, 'oven_edit_depositor', [
    ops,
    enable,
    address && address.trim().length > 1 ? address : undefined,
  ]);
  return operation;
};

export const deposit = async (
  ovenAddress: string,
  amount: number,
): Promise<TransactionWalletOperation> => {
  const ovenContract = await initContract(ovenAddress);
  const operation = await executeMethod(ovenContract, 'default', undefined, 0, amount);
  return operation;
};

export const withdraw = async (
  ovenId: number,
  amount: number,
  to: string,
): Promise<TransactionWalletOperation> => {
  const operation = await executeMethod(cTez, 'withdraw_from_oven', [ovenId, amount * 1e6, to]);
  return operation;
};

export const liquidate = async (
  ovenId: number,
  overOwner: string,
  amount: number,
  to: string,
): Promise<TransactionWalletOperation> => {
  const operation = await executeMethod(cTez, 'liquidate_oven', [ovenId, overOwner, amount * 1e6, to]);
  return operation;
};

export const mintOrBurn = async (
  ovenId: number,
  quantity: number,
): Promise<TransactionWalletOperation> => {
  const operation = await executeMethod(cTez, 'mint_or_burn', [ovenId, quantity * 1e6]);
  return operation;
};

export const getOvenDelegate = async (userOven: string): Promise<string | null> => {
  const tezos = getTezosInstance();
  const baker = await tezos.rpc.getDelegate(userOven);
  return baker;
};

export const prepareOvenCall = async (
  storage: any,
  ovenId: number | BigNumber,
  userAddress: string,
): Promise<Oven> => {
  const userOven = await storage.ovens.get({
    id: ovenId,
    owner: userAddress,
  });
  const baker = userOven ? await getOvenDelegate(userOven.address) : null;
  return { ...userOven, baker, ovenId };
};

export const prepareExternalOvenCall = async (
  storage: any,
  ovenAddress: string,
  userAddress: string,
): Promise<Oven> => {
  const ovenContract = await initContract(ovenAddress);
  const {
    handle: { id, owner },
  } = await ovenContract.storage<OvenStorage>();
  const ovenData = await prepareOvenCall(storage, id, owner);
  return { ...ovenData, isImported: true, isExternal: owner !== userAddress };
};

export const getOvens = async (userAddress: string): Promise<Oven[] | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const lastOvenId = getLastOvenId(userAddress, cTez.address);
    const storage: any = await cTez.storage();
    const ovens: Promise<Oven>[] = [];
    for (let i = lastOvenId; i > 0; i -= 1) {
      ovens.push(prepareOvenCall(storage, i, userAddress));
    }
    const allOvenData = await Promise.all(ovens);
    return allOvenData;
  } catch (error: any) {
    logger.error(error);
  }
};

export const getAllOvens = async (): Promise<AllOvenDatum[] | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const allOvenData = await getAllOvensAPI();
    return allOvenData;
  } catch (error: any) {
    logger.error(error);
    return undefined;
  }
};

export const getUserOvens = async (userAddress: string): Promise<AllOvenDatum[] | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const userOvenData = await getUserOvensAPI(userAddress, CTEZ_CONTRACT_BIGMAP);
    return userOvenData;
  } catch (error: any) {
    logger.error(error);
    return undefined;
  }
};

export const getOven = async (ovenAddress: string): Promise<AllOvenDatum | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const ovenDatum = await getOvenByAddressAPI(ovenAddress);
    return ovenDatum;
  } catch (error: any) {
    logger.error(error);
    return undefined;
  }
};

export const getExternalOvenData = async (
  externalOvens: string[],
  userAddress: string,
): Promise<Oven[] | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const storage: any = await cTez.storage();
    const allOvenData = await Promise.all(
      externalOvens.map((item) => prepareExternalOvenCall(storage, item, userAddress)),
    );
    return allOvenData;
  } catch (error: any) {
    logger.error(error);
  }
};

export const getOvenDepositor = async (ovenAddress: string): Promise<depositors> => {
  const ovenContract = await initContract(ovenAddress);
  const ovenStorage: OvenStorage = await ovenContract.storage();
  return ovenStorage.depositors;
};

export const isOven = async (ovenAddress: string): Promise<boolean> => {
  try {
    const ovenContract = await initContract(ovenAddress);
    const ovenStorage: OvenStorage = await ovenContract.storage();
    return typeof ovenStorage?.handle !== 'undefined' && typeof ovenStorage?.admin !== 'undefined';
  } catch (error: any) {
    logger.error(error);
  }
  return false;
};

type FA12TokenType = 'ctez' | 'lqt';

export const getTokenAllowanceOps = async (
  tokenContract: WalletContract,
  userAddress: string,
  newAllowance: number,
  tokenType: FA12TokenType = 'ctez',
): Promise<WalletParamsWithKind[]> => {
  const batchOps: WalletParamsWithKind[] = [];
  const maxTokensDeposited = tokenType === 'ctez' ? newAllowance * 1e6 : newAllowance;
  const currentAllowance = new BigNumber(
    (await tokenContract.contractViews.viewAllowance({ owner: userAddress, spender: CTEZ_ADDRESS }).executeView({ viewCaller: tokenContract.address })) ?? 0,
  )
    .shiftedBy(-6)
    .toNumber();
  if (currentAllowance < newAllowance) {
    if (currentAllowance > 0) {
      batchOps.push({
        kind: OpKind.TRANSACTION,
        ...tokenContract.methods.approve(CTEZ_ADDRESS, 0).toTransferParams(),
      });
    }
    batchOps.push({
      kind: OpKind.TRANSACTION,
      ...tokenContract.methods.approve(CTEZ_ADDRESS, maxTokensDeposited).toTransferParams(),
    });
  }
  return batchOps;
};

export const addCtezLiquidity = async (args: AddLiquidityParams): Promise<WalletOperation> => {
  const tezos = getTezosInstance();
  const CTezFa12 = await getCTezFa12Contract();
  const batchOps: WalletParamsWithKind[] = await getTokenAllowanceOps(
    CTezFa12,
    args.owner,
    args.amount,
  );
  const batch = tezos.wallet.batch([
    ...batchOps,
    {
      kind: OpKind.TRANSACTION,
      ...cTez.methods
        .add_ctez_liquidity(
          args.owner,
          args.amount * 1e6,
          args.minLqtMinted.toString(10),
          args.deadline.toISOString(),
        )
        .toTransferParams(),
      amount: 0,
    },
    {
      kind: OpKind.TRANSACTION,
      ...CTezFa12.methods.approve(CTEZ_ADDRESS, 0).toTransferParams(),
    },
  ]);
  const hash = await batch.send();
  return hash;
};

export const addTezLiquidity = async (args: AddLiquidityParams): Promise<WalletOperation> => {
  const hash = await cTez.methods.add_tez_liquidity(
    args.owner,
    args.minLqtMinted.toString(10),
    args.deadline.toISOString(),
  ).send({ amount: args.amount })
  return hash;
};

export const addLiquidity = async (args: AddLiquidityParams): Promise<WalletOperation> => {
  return args.isCtezSide ? addCtezLiquidity(args) : addTezLiquidity(args);
};

export const removeLiquidity = async (
  args: RemoveLiquidityParams,
  userAddress: string,
): Promise<WalletOperation> => {
  const tezos = getTezosInstance();

  const hash = await cTez.methods[args.isCtezSide ? 'remove_ctez_liquidity' : 'remove_tez_liquidity'](
    args.to,
    args.lqtBurned.integerValue().toString(10),
    args.minSelfReceived.integerValue().toString(10),
    args.minProceedsReceived.integerValue().toString(10),
    args.minSubsidyReceived.integerValue().toString(10),
    args.deadline.toISOString(),
  ).send();
  return hash;
};

export const collectFromLiquidity = async (
  args: CollectFromLiquidityParams,
): Promise<WalletOperation> => {
  const hash = await cTez.methods[args.isCtezSide ? 'collect_from_ctez_liquidity' : 'collect_from_tez_liquidity'](
    args.to,
  ).send();
  return hash;
};

export const tezToCtez = async (args: TezToCtezParams): Promise<TransactionWalletOperation> => {
  const operation = await executeMethod(
    cTez,
    'tez_to_ctez',
    [args.to, Math.floor(args.minCtezBought * 1e6), args.deadline.toISOString()],
    undefined,
    args.tezSold * 1e6,
    true,
  );
  return operation;
};

export const ctezToTez = async (
  args: ctezToTezParams,
  userAddress: string,
): Promise<WalletOperation> => {
  const tezos = getTezosInstance();
  const CTezFa12 = await getCTezFa12Contract();
  const batchOps: WalletParamsWithKind[] = await getTokenAllowanceOps(
    CTezFa12,
    userAddress,
    args.ctezSold,
  );

  const batch = tezos.wallet.batch([
    ...batchOps,
    {
      kind: OpKind.TRANSACTION,
      ...cTez.methods
        .ctez_to_tez(
          args.to,
          args.ctezSold * 1e6,
          Math.floor(args.minTezBought * 1e6),
          args.deadline.toISOString(),
        )
        .toTransferParams(),
    },
    {
      kind: OpKind.TRANSACTION,
      ...CTezFa12.methods.approve(CTEZ_ADDRESS, 0).toTransferParams(),
    },
  ]);
  const batchOperation = await batch.send();
  return batchOperation;
};

export const tokenToToken = async (
  args: TokenToTokenParams,
): Promise<TransactionWalletOperation> => {
  const operation = await executeMethod(cTez, 'tokenToToken', [
    args.outputCfmmContract,
    args.minTokensBought * 1e6,
    args.to,
    args.tokensSold * 1e6,
    args.deadline.toISOString(),
  ]);
  return operation;
};
