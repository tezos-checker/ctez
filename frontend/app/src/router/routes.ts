import { ComponentRoute } from '../interfaces/router';
import { AddLiquidityPage } from '../pages/AddLiquidity';
import { CreateVaultPage } from '../pages/CreateVaultPage';
import { HomePage } from '../pages/Home';

export const routes: ComponentRoute[] = [
  {
    component: AddLiquidityPage,
    path: '/add-liquidity',
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
