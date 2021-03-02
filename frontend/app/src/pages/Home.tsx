import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkList } from '../components/LinkList/LinkList';
import Page from '../components/Page';
import { ovenExists } from '../contracts/ctez';
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
  useEffect(() => {
    /**
     * TODO: Needs refactor
     */
    const getOvenStatus = async () => {
      if (userAddress) {
        const ovenStatus = await ovenExists(userAddress);
        if (!ovenStatus && !list[0].to.includes('/create')) {
          console.log(ovenStatus);
          setList([
            {
              to: '/create',
              primary: t('createVault'),
            },
            ...list,
          ]);
        } else {
          setList(methodList);
        }
      } else if (!userAddress && !list[0].to.includes('/create')) {
        setList([
          {
            to: '/create',
            primary: t('createVault'),
          },
          ...list,
        ]);
      }
    };
    getOvenStatus();
  }, [userAddress]);

  return (
    <Page>
      <LinkList list={list} />
    </Page>
  );
};
