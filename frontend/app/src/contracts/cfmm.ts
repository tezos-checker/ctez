import { WalletContract } from '@taquito/taquito';
import { AddLiquidityParams, ErrorType, RemoveLiquidityParams } from '../interfaces';
import { executeMethod, initContract } from './utils';

let cfmm: WalletContract;

export const initCfmm = async (address: string): Promise<void> => {
  cfmm = await initContract(address);
};

export const addLiquidity = async (args: AddLiquidityParams): Promise<string> => {
  const hash = await executeMethod(cfmm, 'addLiquidity', [
    args.owner,
    args.minLqtMinted,
    args.maxTokensDeposited,
    args.deadline.toISOString(),
  ]);
  return hash;
};

export const removeLiquidity = async (args: RemoveLiquidityParams): Promise<string> => {
  const hash = await executeMethod(cfmm, 'removeLiquidity', [
    args.to,
    args.lqtBurned,
    args.minCashWithdrawn,
    args.minTokensWithdrawn,
    args.deadline.toISOString(),
  ]);
  return hash;
};

export const cfmmError: ErrorType = {
  0: 'TOKEN CONTRACT MUST HAVE A TRANSFER ENTRYPOINT',
  1: 'ASSERTION VIOLATED CASH BOUGHT SHOULD BE LESS THAN CASHPOOL',
  2: 'PENDING POOL UPDATES MUST BE ZERO',
  3: 'THE CURRENT TIME MUST BE LESS THAN THE DEADLINE',
  4: 'MAX TOKENS DEPOSITED MUST BE GREATER THAN OR EQUAL TO TOKENS DEPOSITED',
  5: 'LQT MINTED MUST BE GREATER THAN MIN LQT MINTED',
  7: 'ONLY NEW MANAGER CAN ACCEPT',
  8: 'CASH BOUGHT MUST BE GREATER THAN OR EQUAL TO MIN CASH BOUGHT',
  9: 'INVALID TO ADDRESS',
  10: 'AMOUNT MUST BE ZERO',
  11: 'THE AMOUNT OF CASH WITHDRAWN MUST BE GREATER THAN OR EQUAL TO MIN CASH WITHDRAWN',
  12: 'LQT CONTRACT MUST HAVE A MINT OR BURN ENTRYPOINT',
  13: 'THE AMOUNT OF TOKENS WITHDRAWN MUST BE GREATER THAN OR EQUAL TO MIN TOKENS WITHDRAWN',
  14: 'CANNOT BURN MORE THAN THE TOTAL AMOUNT OF LQT',
  15: 'TOKEN POOL MINUS TOKENS WITHDRAWN IS NEGATIVE',
  16: 'CASH POOL MINUS CASH WITHDRAWN IS NEGATIVE',
  17: 'CASH POOL MINUS CASH BOUGHT IS NEGATIVE',
  18: 'TOKENS BOUGHT MUST BE GREATER THAN OR EQUAL TO MIN TOKENS BOUGHT',
  19: 'TOKEN POOL MINUS TOKENS BOUGHT IS NEGATIVE',
  20: 'ONLY MANAGER CAN SET BAKER',
  21: 'ONLY MANAGER CAN SET MANAGER',
  22: 'BAKER PERMANENTLY FROZEN',
  24: 'LQT ADDRESS ALREADY SET',
  25: 'CALL NOT FROM AN IMPLICIT ACCOUNT',
  28: 'INVALID FA12 TOKEN CONTRACT MISSING GETBALANCE',
  29: 'THIS ENTRYPOINT MAY ONLY BE CALLED BY GETBALANCE OF TOKENADDRESS',
  31: 'INVALID INTERMEDIATE CONTRACT',
  30: 'THIS ENTRYPOINT MAY ONLY BE CALLED BY GETBALANCE OF CASHADDRESS',
  32: 'TEZ DEPOSIT WOULD BE BURNED',
  33: 'INVALID FA12 CASH CONTRACT MISSING GETBALANCE',
  34: 'MISSING APPROVE ENTRYPOINT IN CASH CONTRACT',
  35: 'CANNOT GET CFMM PRICE ENTRYPOINT FROM CONSUMER',
};
