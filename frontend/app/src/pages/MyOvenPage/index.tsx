import { CircularProgress, Grid, Box } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from '../../components/Drawer/Drawer';
import { OvenActions } from '../../components/OvenActions/OvenActions';
import { OvenCard } from '../../components/OvenCard/OvenCard';
import Page from '../../components/Page';
import { useWallet } from '../../wallet/hooks';
import { RootState } from '../../redux/rootReducer';
import { OvenSlice } from '../../redux/slices/OvenSlice';
import { UserOvenStats } from '../../interfaces';
import {
  getExternalOvens,
  getOvenImageId,
  getOvenMaxCtez,
  removeExternalOven,
  toSerializeableOven,
} from '../../utils/ovenUtils';
import { useCtezBaseStats, useOvenData } from '../../api/queries';
import { isMonthFromLiquidation } from '../../api/contracts';
import { CTEZ_ADDRESS } from '../../utils/globals';

export const MyOvenPage: React.FC = () => {
  const { t } = useTranslation(['common', 'header']);
  const dispatch = useDispatch();
  const [extOvens, setExtOvens] = useState<string[]>();
  const originalTarget = useSelector((state: RootState) =>
    Number(state.stats.baseStats?.originalTarget),
  );
  const { showActions } = useSelector((state: RootState) => state.oven);
  const [{ pkh: userAddress }] = useWallet();
  const { data: ovenData, isLoading } = useOvenData(userAddress, extOvens);
  const { data: baseStats } = useCtezBaseStats(userAddress);

  useEffect(() => {
    if (userAddress && CTEZ_ADDRESS) {
      setExtOvens(getExternalOvens(userAddress, CTEZ_ADDRESS));
    }
  }, [userAddress, CTEZ_ADDRESS]);

  useEffect(() => {
    if (ovenData && ovenData.length > 0) {
      const ovenUserData: UserOvenStats = ovenData.reduce(
        (acc, item) => {
          if (!item.isExternal) {
            acc.ctez += item.ctez_outstanding.shiftedBy(-6).toNumber();
            acc.xtz += item.tez_balance.shiftedBy(-6).toNumber();
            return acc;
          }
          return acc;
        },
        { xtz: 0, ctez: 0, totalOvens: ovenData.length },
      );
      dispatch(OvenSlice.actions.setUserOvenData(ovenUserData));
    }
  }, [ovenData]);

  return (
    <Page showStats>
      {isLoading && <CircularProgress />}
      {!isLoading && (
        <Grid
          container
          direction="row"
          alignItems="flex-start"
          justifyItems="flex-start"
          spacing={3}
        >
          {ovenData &&
            ovenData.length > 0 &&
            ovenData
              .sort((a, b) => {
                const newA = typeof a.ovenId === 'number' ? a.ovenId : a.ovenId.toNumber();
                const newB = typeof b.ovenId === 'number' ? b.ovenId : b.ovenId.toNumber();
                return newB - newA;
              })
              .map((ovenValue, index) => {
                const isMonthAway = baseStats
                  ? isMonthFromLiquidation(
                      ovenValue.ctez_outstanding.toNumber(),
                      Number(baseStats?.originalTarget),
                      ovenValue.tez_balance.toNumber(),
                      baseStats?.drift,
                    )
                  : false;
                const { max } = originalTarget
                  ? getOvenMaxCtez(
                      ovenValue.tez_balance.toString(),
                      ovenValue.ctez_outstanding.toString(),
                      originalTarget,
                    )
                  : { max: 0 };
                return (
                  <Grid item key={`${ovenValue.address}-${index}`}>
                    <OvenCard
                      {...ovenValue}
                      isMonthAway={isMonthAway}
                      maxCtez={max}
                      imageId={getOvenImageId(
                        typeof ovenValue.ovenId === 'number'
                          ? ovenValue.ovenId
                          : ovenValue.ovenId.toNumber(),
                        ovenData.length,
                      )}
                      action={() => {
                        dispatch(OvenSlice.actions.setOven(toSerializeableOven(ovenValue)));
                        dispatch(OvenSlice.actions.toggleActions(true));
                      }}
                      removeExternalAction={
                        ovenValue.isImported
                          ? () => {
                              if (userAddress && typeof CTEZ_ADDRESS !== 'undefined') {
                                const newOvens = removeExternalOven(
                                  userAddress,
                                  CTEZ_ADDRESS,
                                  ovenValue.address,
                                );
                                setExtOvens(newOvens);
                              }
                            }
                          : undefined
                      }
                    />
                  </Grid>
                );
              })}
        </Grid>
      )}
      {!isLoading && !userAddress && <Box p={3}>{t('signInToSeeOvens')}</Box>}
      {!isLoading && userAddress && ovenData?.length === 0 && <Box p={3}>{t('noOvens')}</Box>}
      {!isLoading && userAddress && ovenData && ovenData.length > 0 && (
        <Drawer
          open={showActions}
          onClose={() => {
            dispatch(OvenSlice.actions.clearOven());
          }}
        >
          <OvenActions />
        </Drawer>
      )}
    </Page>
  );
};
