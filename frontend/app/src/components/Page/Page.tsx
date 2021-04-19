import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, IconButton } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet-async';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE } from '../../i18n';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { Header } from '../Header';
import { Typography } from '../Typography';
import { StatsSlice } from '../../redux/slices/StatsSlice';
import { StatItem } from '../Header/Header';
import { useCtezBaseStats } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';

const ContainerStyled = styled(Container)`
  padding-top: 1em;
  padding-bottom: 2rem;
`;

const BUY_SELL_STATS = ['totalLiquidity'];
const OVEN_STATS = [
  'currentTarget',
  'currentPrice',
  'premium',
  'currentAnnualDrift',
  'annualDriftPastWeek',
];

export interface PageProps {
  title?: string;
  showBackButton?: boolean;
  description?: string;
  showStats?: boolean;
}

interface PageLocationStateParams {
  backPath?: string;
}

export const Page: React.FC<PageProps> = ({ title, children, description, showStats = false }) => {
  const { state, pathname } = useLocation<PageLocationStateParams>();
  const history = useHistory();
  const { i18n, t } = useTranslation(['common']);
  const lang = i18n.language || window.localStorage.i18nextLng || DEFAULT_LANGUAGE;
  const pageTitle = title ? `${title} - ${APP_NAME} - ${NETWORK}` : `${APP_NAME} - ${NETWORK}`;
  const [{ pkh }] = useWallet();
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const dispatch = useDispatch();
  const { data: stats, isLoading } = useCtezBaseStats(pkh);

  useEffect(() => {
    if (stats) {
      dispatch(StatsSlice.actions.setBaseStats(stats));
      const keys = pathname.includes('buy-sell') ? [...BUY_SELL_STATS, ...OVEN_STATS] : OVEN_STATS;
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
  }, [stats]);

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      {!isLoading ? (
        <>
          <Header onClick={() => history.push('/')} stats={statsData} loggedIn={!!pkh} />
          {title && (
            <ContainerStyled>
              <IconButton
                onClick={() => {
                  state?.backPath ? history.push(state.backPath) : history.goBack();
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography size="2rem" component="h1">
                {title}
              </Typography>
            </ContainerStyled>
          )}
          <ContainerStyled>{!isLoading ? children : <CircularProgress />}</ContainerStyled>
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};
