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

const contractInitPromises: Record<string, Promise<ContractAbstraction<Wallet>> | undefined> = {};

export const initContract = async (
  address: string | null = null,
): Promise<ContractAbstraction<Wallet>> => {
  if (!address) {
    throw new Error('contract address not set');
  }
  if (contractInitPromises[address]) {
    return contractInitPromises[address]!;
  }
  const tezos = getTezosInstance();
  if (tezos === null) {
    throw new Error('Tezos not initialized');
  }
  const promise = tezos.wallet.at(address)
    .then(contract => {
      delete contractInitPromises[address];
      return contract;
    })
    .catch(err => {
      delete contractInitPromises[address];
      throw err;
    });
  contractInitPromises[address] = promise;
  return promise;
};
