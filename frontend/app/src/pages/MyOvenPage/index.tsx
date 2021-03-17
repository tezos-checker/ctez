import { CircularProgress, Grid, Box } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Drawer } from '../../components/Drawer/Drawer';
import { OvenActions } from '../../components/OvenActions/OvenActions';
import { OvenCard } from '../../components/OvenCard/OvenCard';
import Page from '../../components/Page';
import { getOvens } from '../../contracts/ctez';
import { useWallet } from '../../wallet/hooks';
import { RootState } from '../../redux/rootReducer';
import { OvenSlice } from '../../redux/slices/OvenSlice';
import { Oven, UserOvenStats } from '../../interfaces';
import { toSerializeableOven } from '../../utils/ovenUtils';

export const MyOvenPage: React.FC = () => {
  const { t } = useTranslation(['common', 'header']);
  const dispatch = useDispatch();
  const { showActions } = useSelector((state: RootState) => state.oven);
  const [{ pkh: userAddress }] = useWallet();
  const { data: ovenData, isLoading } = useQuery<Oven[], AxiosError, Oven[]>(
    ['ovenData', userAddress],
    async () => {
      if (userAddress) {
        const ovens = await getOvens(userAddress);
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
  useEffect(() => {
    if (ovenData && ovenData.length > 0) {
      const ovenUserData: UserOvenStats = ovenData.reduce(
        (acc, item) => {
          acc.ctez += item.ctez_outstanding.shiftedBy(-6).toNumber();
          acc.xtz += item.tez_balance.shiftedBy(-6).toNumber();
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
              .sort((a, b) => b.ovenId - a.ovenId)
              .map((ovenValue, index) => {
                return (
                  <Grid item key={`${ovenValue.address}-${index}`}>
                    <OvenCard
                      {...ovenValue}
                      totalOvens={ovenData.length}
                      action={() => {
                        dispatch(OvenSlice.actions.setOven(toSerializeableOven(ovenValue)));
                        dispatch(OvenSlice.actions.toggleActions(true));
                      }}
                    />
                  </Grid>
                );
              })}
        </Grid>
      )}
      {!isLoading && userAddress && ovenData?.length === 0 && <Box p={3}>{t('noOvens')}</Box>}
      {!isLoading && ovenData && ovenData.length > 0 && (
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
