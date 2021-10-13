import { useAppSelector } from '../redux/store';
import { AllOvenDatum } from '../interfaces';

export function useMyOvensSelector(
  userAddress: string | undefined,
): { ovens: AllOvenDatum[] | null; isLoading: boolean };

export function useMyOvensSelector(
  userAddress: string | undefined,
  ovenId: string,
): { oven: AllOvenDatum | null; isLoading: boolean };

// ? Using function overload
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

    return { ovens: userOvens, isLoading: state.oven.allOvens.isLoading };
  });
}
