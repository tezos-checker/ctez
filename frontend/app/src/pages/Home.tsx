import { Button } from '@material-ui/core';
import Page from '../components/Page';
import { create, deposit, liquidate, mintOrBurn, withdraw } from '../contracts/ctez';
import { useWallet } from '../wallet/hooks';

export const HomePage: React.FC = () => {
  const [{ pkh }] = useWallet();
  return (
    <Page>
      Home Page
      <Button
        onClick={() => {
          create('tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9');
        }}
      >
        Create
      </Button>
      <Button
        onClick={() => {
          deposit(1);
        }}
      >
        Deposit
      </Button>
      <Button
        onClick={() => {
          pkh && withdraw(1, pkh);
        }}
      >
        Withdraw
      </Button>
      <Button
        onClick={() => {
          pkh && liquidate(pkh, 1, pkh);
        }}
      >
        Liquidate
      </Button>
      <Button
        onClick={() => {
          mintOrBurn(1);
        }}
      >
        Mint or Burn
      </Button>
    </Page>
  );
};
