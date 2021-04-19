import BigNumber from 'bignumber.js';
import { sub, format, differenceInDays } from 'date-fns';
import { getCfmmStorage, getLQTContractStorage } from '../contracts/cfmm';
import { getCtezStorage } from '../contracts/ctez';
import { BaseStats, CTezTzktStorage, UserLQTData } from '../interfaces';
import { CONTRACT_DEPLOYMENT_DATE } from '../utils/globals';
import { getCTezTzktStorage, getLastBlockOfTheDay } from './tzkt';

export const getPrevCTezStorage = async (
  days = 7,
  userAddress?: string,
): Promise<CTezTzktStorage> => {
  const prevDate = format(sub(new Date(), { days }), 'yyyy-MM-dd');
  const lastBlock = await getLastBlockOfTheDay(prevDate, userAddress);
  const storage = await getCTezTzktStorage(lastBlock.level, userAddress);
  return storage;
};

export const getBaseStats = async (userAddress?: string): Promise<BaseStats> => {
  const diffInDays = differenceInDays(new Date(), new Date(CONTRACT_DEPLOYMENT_DATE));
  const prevStorageDays = diffInDays >= 7 ? 7 : diffInDays;
  const cTezStorage = await getCtezStorage();
  const cfmmStorage = await getCfmmStorage();
  const cTez7dayStorage = await getPrevCTezStorage(prevStorageDays, userAddress);
  const prevTarget = Number(cTez7dayStorage.target) / 2 ** 48;
  const currentTarget = cTezStorage.target.toNumber() / 2 ** 48;
  const currentPrice = cfmmStorage.cashPool.toNumber() / cfmmStorage.tokenPool.toNumber();
  const premium = currentPrice === currentTarget ? 0 : currentPrice / currentTarget - 1.0;
  const drift = cTezStorage.drift.toNumber();
  const currentAnnualDrift = (1.0 + drift / 2 ** 48) ** (365.25 * 24 * 3600) - 1.0;
  const annualDriftPastWeek = (currentTarget / prevTarget) ** 52.1786 - 1.0;
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

export const getUserLQTData = async (userAddress: string): Promise<UserLQTData> => {
  const cfmmStorage = await getCfmmStorage();
  const lqtTokenStorage = await getLQTContractStorage();
  const userLqtBalance: BigNumber =
    (await lqtTokenStorage.tokens.get(userAddress)) ?? new BigNumber(0);
  return {
    lqt: userLqtBalance.toNumber(),
    lqtShare: Number(
      ((userLqtBalance.toNumber() / cfmmStorage.lqtTotal.toNumber()) * 100).toFixed(2),
    ),
  };
};

export const isMonthFromLiquidation = (
  outstandingCtez: number,
  target: number,
  tezBalance: number,
  currentDrift: number,
): boolean => {
  return (
    outstandingCtez *
      (target / 2 ** 48) *
      (1 + currentDrift / 2 ** 48) ** ((365.25 * 24 * 3600) / 12) *
      (16 / 15) >
    tezBalance
  );
};
