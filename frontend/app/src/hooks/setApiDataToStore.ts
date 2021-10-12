import { useEffect } from 'react';
import { useAllOvenData, useCtezBaseStats, useOvenData } from '../api/queries';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setBaseStats } from '../redux/slices/StatsSlice';
import { UserOvenStats } from '../interfaces';
import { OvenSlice, setAllOvenData, setExternalOvens } from '../redux/slices/OvenSlice';
import { CTEZ_ADDRESS } from '../utils/globals';
import { getExternalOvens } from '../utils/ovenUtils';

const useSetCtezBaseStatsToStore = (userAddress: string | undefined) => {
  const dispatch = useAppDispatch();
  const { data: baseStats, isSuccess } = useCtezBaseStats(userAddress);

  useEffect(() => {
    if (isSuccess && baseStats) {
      dispatch(setBaseStats(baseStats));
    }
  }, [isSuccess, baseStats, dispatch]);
};

const useSetOvenDataToStore = (userAddress: string | undefined) => {
  const dispatch = useAppDispatch();
  const extOvens = useAppSelector((state) => state.oven.extOvens);

  const { data: ovenData, isLoading: isMyOvensLoading } = useOvenData(userAddress, extOvens);

  useEffect(() => {
    if (ovenData && ovenData.length > 0) {
      const ovenUserData: UserOvenStats = ovenData.reduce(
        (acc, item) => {
          if (!item.isExternal) {
            acc.ctez += Number(item.ctez_outstanding);
            acc.xtz += Number(item.tez_balance);
            return acc;
          }
          return acc;
        },
        { xtz: 0, ctez: 0, totalOvens: ovenData.length },
      );
      dispatch(OvenSlice.actions.setUserOvenData(ovenUserData));
      dispatch(OvenSlice.actions.setOvens(ovenData));
    }
  }, [dispatch, ovenData]);

  return { isMyOvensLoading };
};

const useSetExtOvensToStore = (userAddress: string | undefined) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (userAddress && CTEZ_ADDRESS) {
      dispatch(setExternalOvens(getExternalOvens(userAddress, CTEZ_ADDRESS)));
    }
  }, [dispatch, userAddress]);
};

const useSetAllOvensToStore = () => {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isLoading, isError } = useAllOvenData();
  useEffect(() => {
    if (isSuccess && data != null) {
      dispatch(setAllOvenData({ data, isSuccess, isLoading, isError }));
    }
  }, [data, isSuccess, isLoading, isError, dispatch]);
};

export {
  useSetCtezBaseStatsToStore,
  useSetOvenDataToStore,
  useSetExtOvensToStore,
  useSetAllOvensToStore,
};
