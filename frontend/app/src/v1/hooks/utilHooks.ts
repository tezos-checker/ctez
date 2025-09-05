import {
  useMemo,
} from 'react';
import { getOvenMaxCtez } from '../utils/ovenUtils';
import { formatNumber } from '../../utils/numbers';
import { 
  AllOvenDatum, 
  BaseStats 
} from '../interfaces';
import { useCtezBaseStats } from '../api/queries';

type TUseOvenStats = (oven: AllOvenDatum | undefined | null) => {
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
  baseStats: BaseStats | undefined;
};

const useOvenStats: TUseOvenStats = (oven) => {
  const { data } = useCtezBaseStats();
  const currentTarget = Number(data?.currentTarget);
  const currentTargetMintable = Number(data?.originalTarget);

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

    const { max, remaining } = currentTargetMintable
      ? getOvenMaxCtez(
          formatNumber(tezBalance, 0),
          formatNumber(ctezOutstanding, 0),
          currentTargetMintable,
        )
      : { max: 0, remaining: 0 };

    const ovenBalance = formatNumber(tezBalance, -6) ?? 0;
    const outStandingCtez = formatNumber(ctezOutstanding, -6) ?? 0;
    const maxMintableCtez = formatNumber(max < 0 ? 0 : max, 0);
    const remainingMintableCtez = remaining < 0 ? 0 : remaining;

    let collateralUtilization = formatNumber(
      (formatNumber(ctezOutstanding, 0) / maxMintableCtez) * 100,
    ).toFixed(2);

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

    const withdrawableTez =
      ovenBalance * (1 - formatNumber(formatNumber(ctezOutstanding, 0) / maxMintableCtez));

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
  }, [currentTarget, currentTargetMintable, oven]);

  return { stats, baseStats: data };
};

type TUseOvenSummary = (ovens: AllOvenDatum[] | undefined | null) => {
  stats: null | {
    totalBalance: number;
    totalOutstandingCtez: number;
    totalRemainingMintableCtez: number;
    totalWithdrawableTez: number;
  };
};

const useOvenSummary: TUseOvenSummary = (ovens) => {
  const { data } = useCtezBaseStats();
  const currentTargetMintable = Number(data?.originalTarget);

  const stats = useMemo(() => {
    if (ovens == null) {
      return null;
    }

    if (ovens.length === 0) {
      return {
        totalBalance: 0,
        totalOutstandingCtez: 0,
        totalRemainingMintableCtez: 0,
        totalWithdrawableTez: 0,
      };
    }

    let totalBalance = 0;
    let totalOutstandingCtez = 0;
    let totalRemainingMintableCtez = 0;
    let totalWithdrawableTez = 0;

    ovens.forEach((oven) => {
      const { tezBalance, ctezOutstanding } = (() => {
        return {
          tezBalance: oven?.value.tez_balance,
          ctezOutstanding: oven?.value.ctez_outstanding,
        };
      })();

      const { max, remaining } = currentTargetMintable
        ? getOvenMaxCtez(
            formatNumber(tezBalance, 0),
            formatNumber(ctezOutstanding, 0),
            currentTargetMintable,
          )
        : { max: 0, remaining: 0 };

      const ovenBalance = formatNumber(tezBalance, -6) ?? 0;
      const maxMintableCtez = formatNumber(max < 0 ? 0 : max, 0);

      totalBalance += ovenBalance;
      totalOutstandingCtez += formatNumber(ctezOutstanding, -6) ?? 0;
      totalRemainingMintableCtez += remaining < 0 ? 0 : remaining;
      totalWithdrawableTez +=
        ovenBalance * (1 - formatNumber(formatNumber(ctezOutstanding, 0) / maxMintableCtez));
    });

    return { totalBalance, totalOutstandingCtez, totalRemainingMintableCtez, totalWithdrawableTez };
  }, [currentTargetMintable, ovens]);

  return { stats };
};



export {
  useOvenStats,
  useOvenSummary,
};
