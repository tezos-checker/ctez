import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkList, LinkListProps } from '../../../components/old/LinkList/LinkList';
import Page from '../../../components/old/Page';

export const BuySell: React.FC = () => {
  const { t } = useTranslation(['common', 'header']);

  const listItem: LinkListProps = {
    list: [
      {
        primary: t('addLiquidity'),
        to: 'old/buy-sell/add-liquidity',
      },
      {
        primary: t('removeLiquidity'),
        to: 'old/buy-sell/remove-liquidity',
      },
      {
        primary: t('tezToCtez'),
        to: 'old/buy-sell/cash-to-token',
      },
      {
        primary: t('ctezToTez'),
        to: 'old/buy-sell/token-to-cash',
      },
    ],
  };

  return (
    <Page title={t('header:buyOrSell')} showStats>
      <LinkList {...listItem} />
    </Page>
  );
};
