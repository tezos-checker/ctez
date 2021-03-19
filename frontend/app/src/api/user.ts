import { getTezosInstance } from '../contracts/client';
import { getCTezFa12Contract } from '../contracts/fa12';
import { UserBalance } from '../interfaces';

export const getUserBalance = async (userAddress: string): Promise<UserBalance> => {
  const tezos = getTezosInstance();
  const ctezFa12 = await getCTezFa12Contract();
  const ctezFa12Storage: any = await ctezFa12.storage();
  const ctez = ((await ctezFa12Storage.tokens.get(userAddress)) ?? 0).shiftedBy(-6).toNumber() ?? 0;
  const xtz = ((await tezos.tz.getBalance(userAddress)) ?? 0).shiftedBy(-6).toNumber() ?? 0;
  return {
    xtz,
    ctez,
  };
};
