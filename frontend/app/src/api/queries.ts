import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { getCfmmStorage } from '../contracts/cfmm';
import { getExternalOvenData, getOvenDelegate, getOvens, getOvenStorage } from '../contracts/ctez';
import {
  Baker,
  BaseStats,
  CfmmStorage,
  Oven,
  OvenStorage,
  UserBalance,
  UserLQTData,
} from '../interfaces';
import { getBaseStats, getUserLQTData } from './contracts';
import { getDelegates } from './tzkt';
import { getUserBalance } from './user';

export const useDelegates = (userAddress?: string) => {
  return useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates(userAddress);
  });
};

export const useCtezBaseStats = (userAddress?: string) => {
  return useQuery<BaseStats, AxiosError, BaseStats>(['baseStats'], async () => {
    return getBaseStats(userAddress);
  });
};

export const useUserBalance = (userAddress?: string) => {
  return useQuery<UserBalance | undefined, AxiosError, UserBalance | undefined>(
    [`user-balance-${userAddress}`],
    () => {
      if (userAddress) {
        return getUserBalance(userAddress);
      }
    },
  );
};
export const useCfmmStorage = () => {
  return useQuery<CfmmStorage, AxiosError, CfmmStorage>(
    ['cfmmStorage'],
    async () => {
      return getCfmmStorage();
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};

export const useOvenData = (userAddress?: string, externalOvens: string[] = []) => {
  return useQuery<Oven[], AxiosError, Oven[]>(
    ['ovenData', userAddress, externalOvens.join()],
    async () => {
      if (userAddress) {
        const userOvens = await getOvens(userAddress);
        const ovens: Oven[] = [];
        if (userOvens && userOvens.length > 0) {
          ovens.push(...userOvens);
        }
        const currentOvens = userOvens?.map((o) => o.address) ?? [];
        const filteredOvens = externalOvens.filter((o) => !currentOvens.includes(o));
        const externals = await getExternalOvenData(filteredOvens, userAddress);
        if (externals && externals.length > 0) {
          ovens.push(...externals);
        }
        const result =
          typeof ovens !== 'undefined'
            ? ovens.filter((data: Oven) => {
                return data && data.baker !== null;
              })
            : [];
        return result;
      }
      return [];
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};

export const useOvenStorage = (ovenAddress?: string) => {
  return useQuery<OvenStorage | undefined, AxiosError, OvenStorage | undefined>(
    ['ovenStorage', ovenAddress],
    async () => {
      if (ovenAddress) {
        return getOvenStorage(ovenAddress);
      }
    },
  );
};

export const useOvenDelegate = (ovenAddress?: string) => {
  return useQuery<string | null | undefined, AxiosError, string | null | undefined>(
    ['ovenDelegate', ovenAddress],
    async () => {
      if (ovenAddress) {
        return getOvenDelegate(ovenAddress);
      }
    },
  );
};

export const useUserLqtData = (userAddress?: string) => {
  return useQuery<UserLQTData | undefined, AxiosError, UserLQTData | undefined>(
    ['userLqtData', userAddress],
    async () => {
      if (userAddress) {
        return getUserLQTData(userAddress);
      }
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};
