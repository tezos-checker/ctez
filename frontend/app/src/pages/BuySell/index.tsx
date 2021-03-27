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
        to: '/buy-sell/add-liquidity',
      },
      {
        primary: t('removeLiquidity'),
        to: '/buy-sell/remove-liquidity',
      },
      {
        primary: t('cashToToken'),
        to: '/buy-sell/cash-to-token',
      },
      {
        primary: t('tokenToCash'),
        to: '/buy-sell/token-to-cash',
      },
    ],
  };

  return (
    <Page title={t('header:buyOrSell')} showStats>
      <LinkList {...listItem} />
    </Page>
  );
};
