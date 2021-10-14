import { createSelector } from 'reselect';
import { RootState, useAppSelector } from '../redux/store';
import { AllOvenDatum } from '../interfaces';

const getAllOvens = (state: RootState) => state.oven.allOvens;

export function useMyOvensSelector(
  userAddress: string | undefined,
): { ovens: AllOvenDatum[] | null; isLoading: boolean };

export function useMyOvensSelector(
  userAddress: string | undefined,
  ovenId: string,
): { oven: AllOvenDatum | null; isLoading: boolean };

// ? Using function overload
// ! Optimize selector using memoization
export function useMyOvensSelector(
  userAddress: string | undefined,
  ovenId?: string,
): { ovens?: AllOvenDatum[] | null; oven?: AllOvenDatum | null; isLoading: boolean } {
  return useAppSelector((state) => {
    if (!userAddress) {
      return { ovens: null, isLoading: false };
    }

    const userOvens = state.oven.allOvens.data?.filter((x) => x.key.owner === userAddress);

    if (ovenId) {
      return {
        oven: userOvens.find((x) => x.key.id === ovenId) ?? null,
        isLoading: state.oven.allOvens.isLoading,
      };
    }

    const importedOvensList = state.oven.extOvens;
    const importedOvens = state.oven.allOvens.data
      ?.filter((x) => importedOvensList.includes(x.value.address))
      .map((x) => ({ ...x, isImported: true }));

    return { ovens: [...userOvens, ...importedOvens], isLoading: state.oven.allOvens.isLoading };
  });
}

export const makeLastOvenIdSelector = () =>
  createSelector(
    [getAllOvens, (_: unknown, userAddress: string | undefined) => userAddress],
    (allOvens, userAddress) => {
      if (!userAddress) {
        return 0;
      }

      const userOvens = allOvens.data
        ?.filter((x) => x.key.owner === userAddress)
        .sort((a, b) => Number(a.key.id) - Number(b.key.id));

      return Number(userOvens[userOvens.length - 1]?.key.id ?? 0);
    },
  );
