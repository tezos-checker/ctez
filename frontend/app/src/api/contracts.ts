import { getCfmmStorage } from '../contracts/cfmm';
import { getCtezStorage } from '../contracts/ctez';
import { BaseStats } from '../interfaces';

export const getBaseStats = async (): Promise<BaseStats> => {
  const cTezStorage = await getCtezStorage();
  const cfmmStorage = await getCfmmStorage();
  const currentTarget = cTezStorage.target.toNumber() / 2 ** 48;
  const currentPrice = cfmmStorage.cashPool.toNumber() / cfmmStorage.tokenPool.toNumber();
  const premium = currentPrice === currentTarget ? 0 : currentPrice / currentTarget - 1.0;
  const drift = cTezStorage.drift.toNumber();
  const currentAnnualDrift = (1.0 + drift / 2 ** 48) ** (365.25 * 24 * 3600) - 1.0;
  const totalLiquidity = (cfmmStorage.cashPool.toNumber() * 2) / 1e6;
  return {
    currentTarget,
    currentPrice,
    premium: premium * 100,
    currentAnnualDrift: currentAnnualDrift * 100,
    totalLiquidity,
  };
};
