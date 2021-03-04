import { ComponentRoute } from '../interfaces/router';
import { AddLiquidityPage } from '../pages/AddLiquidity';
import { CreateVaultPage } from '../pages/CreateVaultPage';
import { DelegatePage } from '../pages/DelegatePage';
import { DepositPage } from '../pages/DepositPage';
import { HomePage } from '../pages/Home';
import { LiquidatePage } from '../pages/Liquidate';
import { MintBurnPage } from '../pages/MintBurnPage';
import { WithdrawPage } from '../pages/Withdraw';

export const routes: ComponentRoute[] = [
  {
    component: AddLiquidityPage,
    path: '/add-liquidity',
  },
  {
    component: DelegatePage,
    path: '/delegate',
  },
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
