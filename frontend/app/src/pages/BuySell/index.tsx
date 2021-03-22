import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkList, LinkListProps } from '../../components/LinkList/LinkList';
import Page from '../../components/Page';

export const BuySell: React.FC = () => {
  const { t } = useTranslation(['common', 'header']);

  const listItem: LinkListProps = {
    list: [
      {
        primary: t('addLiquidity'),
        to: '/add-liquidity',
      },
      {
        primary: t('removeLiquidity'),
        to: '/remove-liquidity',
      },
      {
        primary: t('cashToToken'),
        to: '/cash-to-token',
      },
      {
        primary: t('tokenToCash'),
        to: '/token-to-cash',
      },
    ],
  };

  return (
    <Page title={t('header:buyOrSell')} showStats>
      <LinkList {...listItem} />
    </Page>
  );
};
