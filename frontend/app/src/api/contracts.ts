import { sub, format, differenceInDays } from 'date-fns';
import { getCfmmStorage } from '../contracts/cfmm';
import { getCtezStorage } from '../contracts/ctez';
import { BaseStats, CTezTzktStorage } from '../interfaces';
import { CONTRACT_DEPLOYMENT_DATE } from '../utils/globals';
import { getCTezTzktStorage, getLastBlockOfTheDay } from './tzkt';

export const getPrevCTezStorage = async (days = 7): Promise<CTezTzktStorage> => {
  const prevDate = format(sub(new Date(), { days }), 'yyyy-MM-dd');
  const lastBlock = await getLastBlockOfTheDay(prevDate);
  const storage = await getCTezTzktStorage(lastBlock.level);
  return storage;
};

export const getBaseStats = async (): Promise<BaseStats> => {
  const diffInDays = differenceInDays(new Date(), new Date(CONTRACT_DEPLOYMENT_DATE));
  const prevStorageDays = diffInDays >= 7 ? 7 : diffInDays;
  const cTezStorage = await getCtezStorage();
  const cfmmStorage = await getCfmmStorage();
  const cTez7dayStorage = await getPrevCTezStorage(prevStorageDays);
  const prevTarget = Number(cTez7dayStorage.target) / 2 ** 48;
  const currentTarget = cTezStorage.target.toNumber() / 2 ** 48;
  const currentPrice = cfmmStorage.cashPool.toNumber() / cfmmStorage.tokenPool.toNumber();
  const premium = currentPrice === currentTarget ? 0 : currentPrice / currentTarget - 1.0;
  const drift = cTezStorage.drift.toNumber();
  const currentAnnualDrift = (1.0 + drift / 2 ** 48) ** (365.25 * 24 * 3600) - 1.0;
  const annualDriftPastWeek = (currentTarget / prevTarget) ** 52.1786 - 1.0;
  const totalLiquidity = (cfmmStorage.cashPool.toNumber() * 2) / 1e6;
  return {
    currentTarget: currentTarget.toFixed(6),
    currentPrice: currentPrice.toFixed(6),
    premium: (premium * 100).toFixed(2),
    currentAnnualDrift: (currentAnnualDrift * 100).toFixed(2),
    annualDriftPastWeek: (annualDriftPastWeek * 100).toFixed(2),
    totalLiquidity: totalLiquidity.toFixed(2),
  };
};
