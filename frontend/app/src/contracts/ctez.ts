import { OpKind, WalletContract, WalletParamsWithKind } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import {
  CTezStorage,
  Depositor,
  depositors,
  EditDepositorOps,
  ErrorType,
  OvenStorage,
  Oven,
} from '../interfaces';
import { CTEZ_ADDRESS } from '../utils/globals';
import { logger } from '../utils/logger';
import { getLastOvenId, saveLastOven } from '../utils/ovenUtils';
import { getTezosInstance } from './client';
import { executeMethod, initContract } from './utils';

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

export const getOvenStorage = async (ovenAddress: string): Promise<OvenStorage> => {
  const ovenContract = await initContract(ovenAddress);
  const storage: OvenStorage = await ovenContract.storage();
  return storage;
};

export const create = async (
  userAddress: string,
  bakerAddress: string,
  op: Depositor,
  allowedDepositors?: string[],
  amount = 0,
): Promise<string> => {
  const newOvenId = getLastOvenId(userAddress, cTez.address) + 1;
  const hash = await executeMethod(
    cTez,
    'create',
    [newOvenId, bakerAddress, op, allowedDepositors],
    undefined,
    amount,
  );
  saveLastOven(userAddress, cTez.address, newOvenId);
  return hash;
};

export const delegate = async (ovenAddress: string, bakerAddress: string): Promise<string> => {
  const ovenContract = await initContract(ovenAddress);
  const hash = await executeMethod(ovenContract, 'oven_delegate', [bakerAddress]);
  return hash;
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

export const addRemoveDepositorList = async (
  ovenAddress: string,
  ovenStorage: OvenStorage,
  addList: string[] = [],
  disableList: string[] = [],
): Promise<string> => {
  const tezos = getTezosInstance();
  const ovenContract = await initContract(ovenAddress);
  const disableAny =
    !Array.isArray(ovenStorage?.depositors) && Object.keys(ovenStorage?.depositors).includes('any');
  const batchOps: WalletParamsWithKind[] = [];
  let prevAddresses: string[] = [];
  if (disableAny) {
    batchOps.push(prepareOvenAllowAnyCall(ovenContract, false));
  } else {
    prevAddresses = ovenStorage?.depositors as string[];
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
): Promise<string> => {
  const ovenContract = await initContract(ovenAddress);
  const hash = await executeMethod(ovenContract, 'oven_edit_depositor', [
    ops,
    enable,
    address && address.trim().length > 1 ? address : undefined,
  ]);
  return hash;
};

export const deposit = async (ovenAddress: string, amount: number): Promise<string> => {
  const ovenContract = await initContract(ovenAddress);
  const hash = await executeMethod(ovenContract, 'default', undefined, 0, amount);
  return hash;
};

export const withdraw = async (ovenId: number, amount: number, to: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'withdraw', [ovenId, amount * 1e6, to]);
  return hash;
};

export const liquidate = async (
  ovenId: number,
  overOwner: string,
  amount: number,
  to: string,
): Promise<string> => {
  const hash = await executeMethod(cTez, 'liquidate', [ovenId, overOwner, amount * 1e6, to]);
  return hash;
};

export const mintOrBurn = async (ovenId: number, quantity: number): Promise<string> => {
  const hash = await executeMethod(cTez, 'mint_or_burn', [ovenId, quantity * 1e6]);
  return hash;
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
  } catch (error) {
    logger.error(error);
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
  } catch (error) {
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
  } catch (error) {
    logger.error(error);
  }
  return false;
};

export const cTezError: ErrorType = {
  0: 'OVEN ALREADY EXISTS',
  1: 'OVEN CAN ONLY BE CALLED FROM MAIN CONTRACT',
  2: 'CTEZ FA12 ADDRESS ALREADY SET',
  3: 'CFMM ADDRESS ALREADY SET',
  4: 'OVEN DOESNT EXIST',
  5: 'OVEN MISSING WITHDRAW ENTRYPOINT',
  6: 'OVEN MISSING DEPOSIT ENTRYPOINT',
  7: 'OVEN MISSING DELEGATE ENTRYPOINT',
  8: 'EXCESSIVE TEZ WITHDRAWAL',
  9: 'CTEZ FA12 CONTRACT MISSING MINT OR BURN ENTRYPOINT',
  10: 'CANNOT BURN MORE THAN OUTSTANDING AMOUNT OF CTEZ',
  11: 'OVEN NOT UNDERCOLLATERALIZED',
  12: 'EXCESSIVE CTEZ MINTING',
  13: 'CALLER MUST BE CFMM',
  1001: 'WITHDRAW CAN ONLY BE CALLED FROM MAIN CONTRACT',
  1002: 'ONLY OWNER CAN DELEGATE',
  1003: 'CANNOT FIND REGISTER DEPOSIT ENTRYPOINT',
  1004: 'UNAUTHORIZED DEPOSITOR',
  1005: 'SET ANY OFF FIRST',
  1006: 'ONLY OWNER CAN EDIT DEPOSITORS',
};
