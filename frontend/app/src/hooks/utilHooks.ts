import { useMemo } from 'react';
import { getOvenMaxCtez } from '../utils/ovenUtils';
import { useAppSelector } from '../redux/store';
import { formatNumber } from '../utils/numbers';
import { AllOvenDatum } from '../interfaces';

type TUseOvenStats = (
  oven: AllOvenDatum | undefined | null,
) => {
  stats: null | {
    ovenBalance: number;
    outStandingCtez: number;
    maxMintableCtez: number;
    remainingMintableCtez: number;
    collateralUtilization: string;
    collateralRatio: string;
    reqTezBalance: number;
    withdrawableTez: number;
  };
};

const useOvenStats: TUseOvenStats = (oven) => {
  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);

  const stats = useMemo(() => {
    if (oven == null) {
      return null;
    }

    const { tezBalance, ctezOutstanding } = (() => {
      return {
        tezBalance: oven?.value.tez_balance,
        ctezOutstanding: oven?.value.ctez_outstanding,
      };
    })();

    const { max, remaining } = currentTarget
      ? getOvenMaxCtez(formatNumber(tezBalance, 0), formatNumber(ctezOutstanding, 0), currentTarget)
      : { max: 0, remaining: 0 };

    const ovenBalance = formatNumber(tezBalance, -6) ?? 0;
    const outStandingCtez = formatNumber(ctezOutstanding, -6) ?? 0;
    const maxMintableCtez = formatNumber(max < 0 ? 0 : max, 0);
    const remainingMintableCtez = remaining < 0 ? 0 : remaining;

    let collateralUtilization = formatNumber(
      (formatNumber(ctezOutstanding, 0) / maxMintableCtez) * 100,
    ).toFixed(1);

    if (collateralUtilization === 'NaN') {
      collateralUtilization = '0';
    }

    const collateralRatio = (100 * (100 / Number(collateralUtilization))).toFixed(1);

    const reqTezBalance = (() => {
      if (currentTarget) {
        return ovenBalance * currentTarget > outStandingCtez
          ? 0
          : outStandingCtez / currentTarget - ovenBalance;
      }
      return 0;
    })();

    const withdrawableTez = (() => {
      if (currentTarget) {
        return ovenBalance * currentTarget <= outStandingCtez
          ? 0
          : outStandingCtez / currentTarget - ovenBalance;
      }
      return 0;
    })();

    return {
      ovenBalance,
      outStandingCtez,
      maxMintableCtez,
      remainingMintableCtez,
      collateralUtilization,
      collateralRatio,
      reqTezBalance,
      withdrawableTez,
    };
  }, [currentTarget, oven]);

  return { stats };
};

type TUseSortedOvensList = (ovens: AllOvenDatum[] | null) => AllOvenDatum[] | null;

const useSortedOvensList: TUseSortedOvensList = (ovens) => {
  const sortByOption = useAppSelector((state) => state.oven.sortByOption);

  return useMemo(() => {
    if (ovens == null) {
      return null;
    }

    if (sortByOption === 'Oven Balance') {
      return ovens
        .slice()
        .sort((a, b) => (Number(a.value.tez_balance) < Number(b.value.tez_balance) ? 1 : -1));
    }

    if (sortByOption === 'Outstanding') {
      return ovens
        .slice()
        .sort((a, b) =>
          Number(a.value.ctez_outstanding) < Number(b.value.ctez_outstanding) ? 1 : -1,
        );
    }

    return ovens;
  }, [ovens, sortByOption]);
};

export { useOvenStats, useSortedOvensList };
