import {
  Box,
  makeStyles,
  Card,
  CardHeader,
  Table,
  TableCell,
  CardContent,
  TableBody,
  TableRow,
} from '@material-ui/core';
import { AxiosError } from 'axios';
import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { getBaseStats } from '../../api/contracts';
import { BaseStats } from '../../interfaces';
import { StatsSlice } from '../../redux/slices/StatsSlice';

const UNISWAP_STATS = ['totalLiquidity'];
const OVEN_STATS = [
  'currentTarget',
  'currentPrice',
  'premium',
  'currentAnnualDrift',
  'annualDriftPastWeek',
];

interface StatItem {
  title: string;
  value: number | string;
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  card: {
    marginTop: 40,
    borderRadius: spacing(0.5),
    transition: '0.3s',
    width: '90%',
    overflow: 'initial',
    background: '#ffffff',
    boxShadow: '0 0 20px 0 rgba(0,0,0,0.12)',
  },
  header: ({ ...styles }) => ({
    backgroundColor: palette.primary.main,
    borderRadius: spacing(2),
    margin: `-40px auto 0`,
    width: '88%',
    color: '#fff',
    boxShadow: '0 2px 4px -2px rgba(0,0,0,0.24), 0 4px 24px -2px rgba(0, 0, 0, 0.2)',
    ...styles,
  }),
  content: {
    paddingTop: 0,
    textAlign: 'left',
    overflowX: 'auto',
    '& table': {
      marginBottom: 0,
    },
  },
}));

interface OvenStatsProps {
  type?: 'oven' | 'uniswap';
}

export const OvenStats: React.FC<OvenStatsProps> = ({ type = 'oven' }) => {
  const { t } = useTranslation(['common']);
  const classes = useStyles();
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const dispatch = useDispatch();
  const { data: stats, isLoading } = useQuery<BaseStats, AxiosError, BaseStats>(
    ['baseStats'],
    async () => {
      return getBaseStats();
    },
  );

  useEffect(() => {
    if (stats) {
      dispatch(StatsSlice.actions.setBaseStats(stats));
      const keys = type === 'oven' ? OVEN_STATS : UNISWAP_STATS;
      const data = keys.map((item) => {
        let value = item === 'totalLiquidity' ? `ꜩ ${stats[item]}` : stats[item];
        value = item === 'premium' || item.includes('Drift') ? `${value}%` : value;
        return {
          title: t(item),
          value,
        };
      });
      setStatsData(data);
    }
  }, [stats, type]);

  return (
    <Box p={3} visibility={isLoading ? 'hidden' : 'visible'}>
      <Card className={cx(classes.card)}>
        <CardHeader title={t('stats')} className={classes.header} />
        <CardContent className={classes.content}>
          <Table>
            <TableBody>
              {statsData.map((row) => (
                <TableRow key={row.title}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};
