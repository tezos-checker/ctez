import { getTezosInstance } from '../contracts/client';
import { getCTezFa12Contract } from '../contracts/fa12';
import { UserBalance } from '../interfaces';
import { getUserOvenData } from './tzkt';

const getXtzBalance = async (userAddress: string) => {
  try {
    const tezos = getTezosInstance();
    const xtz = ((await tezos.tz.getBalance(userAddress)) ?? 0).shiftedBy(-6).toNumber() ?? 0;
    return xtz;
  } catch (error) {
    return 0;
  }
};

const getCtezBalance = async (userAddress: string) => {
  try {
    const ctezFa12 = await getCTezFa12Contract();
    const ctezFa12Storage: any = await ctezFa12.storage();
    const ctez =
      ((await ctezFa12Storage.tokens.get(userAddress)) ?? 0).shiftedBy(-6).toNumber() ?? 0;
    return ctez;
  } catch (error) {
    return 0;
  }
};

export const getUserBalance = async (userAddress: string): Promise<UserBalance> => {
  try {
    const ctez = await getCtezBalance(userAddress);
    const xtz = await getXtzBalance(userAddress);
    const { tezInOvens, ctezOutstanding } = await getUserOvenData(userAddress);
    console.log(tezInOvens);
    return {
      xtz,
      ctez,
      tezInOvens,
      ctezOutstanding,
    };
  } catch (error) {
    return {
      xtz: 0,
      ctez: 0,
      tezInOvens: 0,
      ctezOutstanding: 0,
    };
  }
};
