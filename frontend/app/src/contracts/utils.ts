import { ContractAbstraction, Wallet, WalletContract } from '@taquito/taquito';
import { getTezosInstance } from './client';

export const executeMethod = async (
  contract: WalletContract,
  methodName: string,
  args: unknown[] = [['Unit']],
  confirmation = 0,
  amount = 0,
  mutez = false,
  onConfirmation?: () => void | Promise<void>,
): Promise<string> => {
  const op = await contract.methods[methodName](...args).send({
    amount: amount > 0 ? amount : undefined,
    mutez,
  });
  if (confirmation > 0) {
    op.confirmation(confirmation)
      .then(() => {
        onConfirmation && onConfirmation();
      })
      .catch(() => {
        onConfirmation && onConfirmation();
      });
  }
  return op.opHash;
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
