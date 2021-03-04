import { CircularProgress } from '@material-ui/core';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { LinkList } from '../components/LinkList/LinkList';
import { OvenCard } from '../components/OvenCard/OvenCard';
import Page from '../components/Page';
import { getOven } from '../contracts/ctez';
import { Oven } from '../interfaces/ctez';
import { useWallet } from '../wallet/hooks';

export const HomePage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const cTezMethods = [
    {
      to: '/create',
      primary: t('createVault'),
    },
    {
      to: '/liquidate',
      primary: t('liquidate'),
    },
  ];

  const cfmmMethods = [
    {
      to: '/add-liquidity',
      primary: t('addLiquidity'),
    },
  ];

  const [{ pkh: userAddress }] = useWallet();

  const { data: ovenData, isLoading } = useQuery<Oven | undefined, AxiosError, Oven | undefined>(
    ['ovenData', userAddress],
    async () => {
      if (userAddress) {
        return getOven(userAddress);
      }
    },
  );

  return (
    <Page>
      {isLoading && <CircularProgress />}
      {!isLoading && ovenData && <OvenCard {...ovenData} />}
      {!isLoading && !ovenData && <LinkList list={cTezMethods} />}
    </Page>
  );
};
