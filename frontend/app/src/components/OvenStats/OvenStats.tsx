import { Box, Grid } from '@material-ui/core';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { getBaseStats } from '../../api/contracts';
import { BaseStats } from '../../interfaces';
import { StatsSlice } from '../../redux/slices/StatsSlice';
import { StatsCard } from '../StatsCard/StatsCard';
import { Typography } from '../Typography';

interface StatCardExtraProps {
  value: string | number;
  isPercentage?: boolean;
  icon?: React.FC<any>;
}

const StatCardExtra: React.FC<StatCardExtraProps> = ({ value, isPercentage, icon: Icon }) => {
  const val = isPercentage ? `${value}%` : value;
  return (
    <>
      {Icon ? (
        <Grid container spacing={3}>
          <Grid item>
            <Icon />
          </Grid>
          <Grid item>
            <Typography size="subtitle1" component="p" textAlign="center" marginTop="0.4rem">
              {val}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Typography size="subtitle1" component="p" textAlign="center">
          {val}
        </Typography>
      )}
    </>
  );
};

export const OvenStats: React.FC = () => {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const { data: stats } = useQuery<BaseStats, AxiosError, BaseStats>(['baseStats'], async () => {
    return getBaseStats();
  });

  useEffect(() => {
    if (stats) {
      dispatch(StatsSlice.actions.setBaseStats(stats));
    }
  }, [stats]);

  return (
    <Box p={3}>
      <Grid container direction="row" spacing={1}>
        {stats &&
          Object.keys(stats).map((item, index) => (
            <Grid item key={`${index}`} md={3} xs="auto" lg={2}>
              <StatsCard label={t(item)}>
                <StatCardExtra
                  value={item === 'totalLiquidity' ? `ꜩ ${stats[item]}` : stats[item]}
                  isPercentage={item === 'premium' || item === 'currentAnnualDrift'}
                />
              </StatsCard>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};
