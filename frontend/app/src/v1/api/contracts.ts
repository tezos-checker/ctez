import axios from 'axios';
// import BigNumber from 'bignumber.js';
import { sub, format, differenceInDays } from 'date-fns';
import {
  getCfmmStorage,
  // getLQTContractStorage 
} from '../contracts/cfmm';
import { getCtezStorage } from '../contracts/ctez';
import {
  BaseStats,
  CTezTzktStorage,
  // OvenBalance,
  // UserLQTData
} from '../interfaces';
import { CONTRACT_DEPLOYMENT_DATE, CTEZ_CONTRACT_BIGMAP } from '../utils/globals';
import { RPC_URL } from '../../utils/globals';
import {
  getCTezTzktStorage,
  getLastBlockOfTheDay,
  getTimeStampOfBlock,
  getUserOvensAPI
} from '../../api/tzkt';
import { OvenBalance } from '../../interfaces';

export const getPrevCTezStorage = async (
  days = 7,
  userAddress?: string,
): Promise<CTezTzktStorage> => {
  const prevDate = format(sub(new Date(), { days }), 'yyyy-MM-dd');

  const lastBlock = await getLastBlockOfTheDay(prevDate, userAddress);
  const storage = await getCTezTzktStorage(lastBlock.level, userAddress);
  return storage;
};
export const getCurrentBlock = async () => {
  const response = await axios.get(`${RPC_URL}/chains/main/blocks/head`);

  return response.data.header.level;
};

export const getBaseStats = async (userAddress?: string): Promise<BaseStats> => {
  const diffInDays = differenceInDays(new Date(), new Date(CONTRACT_DEPLOYMENT_DATE));
  const prevStorageDays = diffInDays >= 7 ? 7 : diffInDays;
  const cTezStorage = await getCtezStorage();
  const cfmmStorage = await getCfmmStorage();
  const cTez7dayStorage = await getPrevCTezStorage(prevStorageDays, userAddress);
  const currentLevel = await getCurrentBlock();
  const timestampCurrent = await getTimeStampOfBlock(currentLevel);
  const date_timestampCurrent = new Date(timestampCurrent);
  const timestamp_lastBlock_seconds = date_timestampCurrent.getTime() / 1000;
  const past_block = currentLevel - 20160;
  const timestampPast = await getTimeStampOfBlock(past_block);
  const datedate_timestampPast = new Date(timestampPast);
  const timestamp_past_seconds = datedate_timestampPast.getTime() / 1000;

  const prevTarget = Number(cTez7dayStorage.target) / 2 ** 48;
  const currentTarget = cTezStorage.target.toNumber() / 2 ** 48;
  const currentPrice = cfmmStorage.cashPool.toNumber() / cfmmStorage.tokenPool.toNumber();
  const premium = currentPrice === currentTarget ? 0 : currentPrice / currentTarget - 1.0;
  const drift = cTezStorage.drift.toNumber();
  const currentAnnualDrift = (1.0 + drift / 2 ** 48) ** (365.25 * 24 * 3600) - 1.0;
  const annualDriftPastWeek =
    (currentTarget / prevTarget) **
    ((365.25 * 24 * 3600) / (timestamp_lastBlock_seconds - timestamp_past_seconds)) -
    1.0;
  const totalLiquidity = (cfmmStorage.cashPool.toNumber() * 2) / 1e6;
  return {
    originalTarget: cTezStorage.target.toNumber(),
    currentTarget: currentTarget.toFixed(6),
    currentPrice: currentPrice.toFixed(6),
    premium: (premium * 100).toFixed(2),
    currentAnnualDrift: (currentAnnualDrift * 100).toFixed(2),
    annualDriftPastWeek: (annualDriftPastWeek * 100).toFixed(2),
    totalLiquidity: totalLiquidity.toFixed(2),
    drift,
  };
};

export const getUserTezCtezData = async (userAddress: string): Promise<OvenBalance> => {
  const userOvenData = await getUserOvensAPI(userAddress, CTEZ_CONTRACT_BIGMAP);
  try {
    return userOvenData.reduce(
      (acc, cur) => ({
        tezInOvens: acc.tezInOvens + Number(cur.value.tez_balance) / 1e6,
        ctezOutstanding: acc.tezInOvens + Number(cur.value.ctez_outstanding) / 1e6,
      }),
      {
        tezInOvens: 0,
        ctezOutstanding: 0,
      },
    );
  } catch (error) {
    return {
      tezInOvens: 0,
      ctezOutstanding: 0,
    };
  }
};

// export const getUserLQTData = async (userAddress: string): Promise<UserLQTData> => {
//   const cfmmStorage = await getCfmmStorage();
//   const lqtTokenStorage = await getLQTContractStorage();
//   const userLqtBalance: BigNumber =
//     (await lqtTokenStorage.tokens.get(userAddress)) ?? new BigNumber(0);
//   return {
//     lqt: userLqtBalance.toNumber(),
//     lqtShare: Number(
//       ((userLqtBalance.toNumber() / cfmmStorage.lqtTotal.toNumber()) * 100).toFixed(6),
//     ),
//   };
// };

export const isMonthFromLiquidation = (
  outstandingCtez: number,
  target: number,
  tezBalance: number,
  currentDrift: number,
  noTargetScale?: boolean,
): boolean => {
  const scaledTarget = noTargetScale ? target : target / 2 ** 48;

  return (
    outstandingCtez *
      scaledTarget *
      (1 + currentDrift / 2 ** 48) ** ((365.25 * 24 * 3600) / 12) *
      (16 / 15) >
    tezBalance
  );
};
