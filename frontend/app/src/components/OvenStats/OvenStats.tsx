import { Box, Grid } from '@material-ui/core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { getBaseStats } from '../../api/contracts';
import { BaseStats } from '../../interfaces';
import { StatsCard } from '../StatsCard/StatsCard';

export const OvenStats: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { data: stats } = useQuery<BaseStats, AxiosError, BaseStats>(['baseStats'], async () => {
    return getBaseStats();
  });

  return (
    <Box p={3}>
      <Grid container direction="row" spacing={1}>
        {stats &&
          Object.keys(stats).map((item, index) => (
            <Grid item key={`${index}`} md={3} xs="auto" lg={2}>
              <StatsCard
                label={t(item)}
                value={stats[item]}
                isPercentage={item === 'premium' || item === 'currentAnnualDrift'}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};
