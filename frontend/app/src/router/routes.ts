import { ComponentRoute } from '../interfaces/router';
import { CreateVaultPage } from '../pages/CreateVaultPage';
import { DepositPage } from '../pages/DepositPage';
import { HomePage } from '../pages/Home';
import { LiquidatePage } from '../pages/Liquidate';
import { MintBurnPage } from '../pages/MintBurnPage';
import { WithdrawPage } from '../pages/Withdraw';

export const routes: ComponentRoute[] = [
  {
    component: MintBurnPage,
    path: '/mint-or-burn',
  },
  {
    component: LiquidatePage,
    path: '/liquidate',
  },
  {
    component: WithdrawPage,
    path: '/withdraw',
  },
  {
    component: DepositPage,
    path: '/deposit',
  },
  {
    component: CreateVaultPage,
    path: '/create',
  },
  {
    component: HomePage,
    path: '/',
  },
];
