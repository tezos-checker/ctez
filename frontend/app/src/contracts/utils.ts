import {
  ContractAbstraction,
  TransactionWalletOperation,
  Wallet,
  WalletContract,
} from '@taquito/taquito';
import { getTezosInstance } from './client';

export const executeMethod = async (
  contract: WalletContract,
  methodName: string,
  args: unknown[] = [['Unit']],
  confirmation = 0,
  amount = 0,
  mutez = false,
): Promise<TransactionWalletOperation> => {
  const op = await contract.methods[methodName](...args).send({
    amount: amount > 0 ? amount : undefined,
    mutez,
  });

  confirmation && (await op.confirmation(confirmation));

  return op;
};

export const initContract = async (
  address: string | null = null,
): Promise<ContractAbstraction<Wallet>> => {
  const tezos = getTezosInstance();
  if (!address || tezos === null) {
    throw new Error('contract address not set or Tezos not initialized');
  }
  const contract = await tezos.wallet.at(address);
  return contract;
};
