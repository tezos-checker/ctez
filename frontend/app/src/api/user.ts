import axios from 'axios';
import { getTezosInstance } from '../contracts/client';
import { getCTezFa12Contract } from '../contracts/fa12';
import { UserBalance } from '../interfaces';

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

export const getUserOvenData = async (userAddress: string) => {
  try {
    const userOvenData: any = await axios.get(
      `https://api.granadanet.tzkt.io/v1/bigmaps/59943/keys?key.owner=${userAddress}`,
    );
    let tezInOvens: any = 0;
    let ctezOutstanding: any = 0;
    const userOvenDataLength: any = userOvenData.data.length;
    for (let i = 0; i < userOvenDataLength; ) {
      tezInOvens += Number(userOvenData.data[i].value.tez_balance) / 1e6;
      ctezOutstanding += Number(userOvenData.data[i].value.ctez_outstanding) / 1e6;
      i += 1;
    }
    return {
      tezInOvens,
      ctezOutstanding,
    };
  } catch (error) {
    return {
      tezInOvens: 0,
      ctezOutstanding: 0,
    };
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
