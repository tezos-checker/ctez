import { AxiosError } from 'axios';
import { useQueries, useQuery } from 'react-query';
import { UseQueryResult } from 'react-query/types/react/types';
import {
  getActualCtezStorage,
  getAllOvens,
  getCtezStorage,
  getExternalOvenData,
  getOven,
  getOvenDelegate,
  getOvens,
  getOvenStorage,
  getUserOvens,
} from '../contracts/ctez';
import {
  AllOvenDatum,
  Baker,
  BaseStats,
  CTezStorage,
  Oven,
  OvenStorage,
  UserBalance,
  UserLQTData,
} from '../interfaces';
import { getBaseStats, getUserLQTData } from './contracts';
import { getDelegates } from './tzkt';
import { getUserBalance } from './user';

type TUseQueryReturn<T> = UseQueryResult<T | undefined, AxiosError>;

export const useDelegates = (userAddress?: string) => {
  return useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates(userAddress);
  });
};

export const useCtezBaseStats = (userAddress?: string) => {
  return useQuery<BaseStats, AxiosError, BaseStats>(
    ['baseStats'],
    async () => {
      return getBaseStats();
    },
    {
      refetchInterval: 30_000,
      staleTime: 3_000,
    },
  );
};

export const useUserBalance = (userAddress?: string) => {
  return useQuery<UserBalance | undefined, AxiosError, UserBalance | undefined>(
    [`user-balance-${userAddress}`],
    () => {
      if (userAddress) {
        return getUserBalance(userAddress);
      }
    },
    {
      refetchInterval: 30_000,
      staleTime: 3_000,
    },
  );
};


export const useCtezStorage = () => {
  return useQuery<CTezStorage, AxiosError, CTezStorage>(
    ['ctezStorage'],
    async () => {
      return getCtezStorage();
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};

export const useActualCtezStorage = () => {
  return useQuery<CTezStorage, AxiosError, CTezStorage>(
    ['actualCtezStorage'],
    async () => {
      return getActualCtezStorage();
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
      refetchInterval: 30_000,
      staleTime: 3_000,
    },
  );
};

export const useAllOvenData = () => {
  return useQuery<AllOvenDatum[] | undefined, AxiosError, AllOvenDatum[] | undefined>(
    ['allOvenData'],
    () => {
      return getAllOvens();
    },
  );
};

export const useUserOvenData = (
  userAddress: string | undefined,
): TUseQueryReturn<AllOvenDatum[]> => {
  return useQuery<AllOvenDatum[] | undefined, AxiosError, AllOvenDatum[] | undefined>(
    ['allOvenData', userAddress],
    () => {
      if (userAddress) {
        return getUserOvens(userAddress);
      }

      // ? Return empty array if userAddress is empty
      return new Promise<AllOvenDatum[]>(() => []);
    },
  );
};

export const useOvenDataByAddresses = (ovenAddresses: string[]) => {
  return useQueries(
    ovenAddresses.map((address) => ({
      queryKey: ['ovenData', address],
      queryFn: () => {
        return getOven(address);
      },
    })),
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
