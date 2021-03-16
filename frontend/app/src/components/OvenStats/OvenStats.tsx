import { Box, Grid } from '@material-ui/core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { getBaseStats } from '../../api/contracts';
import { BaseStats } from '../../interfaces';
import { StatsCard } from '../StatsCard/StatsCard';
import TezosIcon from '../TezosIcon';
import { Typography } from '../Typography';

interface StatCardExtraProps {
  value: string;
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
  const { data: stats } = useQuery<BaseStats, AxiosError, BaseStats>(['baseStats'], async () => {
    return getBaseStats();
  });

  return (
    <Box p={3}>
      <Grid container direction="row" spacing={1}>
        {stats &&
          Object.keys(stats).map((item, index) => (
            <Grid item key={`${index}`} md={3} xs="auto" lg={2}>
              <StatsCard label={t(item)}>
                <StatCardExtra
                  value={stats[item]}
                  isPercentage={item === 'premium' || item === 'currentAnnualDrift'}
                  icon={item === 'totalLiquidity' ? TezosIcon : undefined}
                />
              </StatsCard>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};
