import { useTranslation } from 'react-i18next';
import { LinkList } from '../components/LinkList/LinkList';
import Page from '../components/Page';

export const HomePage: React.FC = () => {
  const { t } = useTranslation(['common']);
  const methodList = [
    {
      to: '/create',
      primary: t('createVault'),
    },
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
  ];

  return (
    <Page>
      <LinkList list={methodList} />
    </Page>
  );
};
