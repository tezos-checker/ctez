import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useParams } from 'react-router-dom';
import { getOvenMaxCtez } from '../utils/ovenUtils';
import { useAppSelector } from '../redux/store';
import { formatNumber } from '../utils/numbers';

// TODO: Refactor usage
const useOvenStats = () => {
  const { ovenId } = useParams<{ ovenId: string }>();
  const oven = useAppSelector((state) =>
    state.oven.ovens.find((x) => {
      const ovenIdFromStore = new BigNumber(x.ovenId);
      return ovenId === ovenIdFromStore.toString();
    }),
  );

  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);

  const stats = useMemo(() => {
    if (oven == null) {
      return null;
    }

    const toNumber = (value: string | number) => {
      return new BigNumber(value).shiftedBy(0).toNumber();
    };

    const { tez_balance, ctez_outstanding } = oven;
    const { max, remaining } = currentTarget
      ? getOvenMaxCtez(toNumber(tez_balance), toNumber(ctez_outstanding), currentTarget)
      : { max: 0, remaining: 0 };

    const outStandingCtez = toNumber(ctez_outstanding) ?? 0;
    const maxMintableCtez = max < 0 ? 0 : max;
    const remainingMintableCtez = remaining < 0 ? 0 : remaining;

    let collateralUtilization = formatNumber(
      (toNumber(ctez_outstanding) / maxMintableCtez) * 100,
    ).toFixed(1);

    if (collateralUtilization === 'NaN') {
      collateralUtilization = '0';
    }

    const collateralRatio = (100 * (100 / Number(collateralUtilization))).toFixed(1);

    return {
      outStandingCtez,
      maxMintableCtez,
      remainingMintableCtez,
      collateralUtilization,
      collateralRatio,
    };
  }, [currentTarget, oven]);

  return { stats, oven, ovenId };
};

export { useOvenStats };
