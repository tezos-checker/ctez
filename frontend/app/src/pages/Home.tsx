import { CircularProgress } from '@material-ui/core';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { LinkList } from '../components/LinkList/LinkList';
import Page from '../components/Page';
import { getOven } from '../contracts/ctez';
import { Oven } from '../interfaces/ctez';
import { useWallet } from '../wallet/hooks';

export const HomePage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const methodList = [
    {
      to: '/deposit',
      primary: t('deposit'),
    },
    {
      to: '/withdraw',
      primary: t('withdraw'),
    },
    {
      to: '/mint-or-burn',
      primary: t('mintOrBurn'),
    },
    {
      to: '/liquidate',
      primary: t('liquidate'),
    },
    {
      to: '/delegate',
      primary: t('delegate'),
    },
  ];
  const [list, setList] = useState(methodList);
  const [{ pkh: userAddress }] = useWallet();

  const { data: ovenData, isLoading } = useQuery<Oven | undefined, AxiosError, Oven | undefined>(
    ['ovenData', userAddress],
    async () => {
      if (userAddress) {
        return getOven(userAddress);
      }
    },
  );

  useEffect(() => {
    if (userAddress && ovenData) {
      setList(methodList);
    } else if (!list[0].to.includes('/create')) {
      setList([
        {
          to: '/create',
          primary: t('createVault'),
        },
        ...list,
      ]);
    }
  }, [ovenData]);

  return <Page>{isLoading ? <CircularProgress /> : <LinkList list={list} />}</Page>;
};
