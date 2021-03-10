import { ComponentRoute } from '../interfaces/router';
import { AddLiquidityPage } from '../pages/AddLiquidity';
import { RemoveLiquidityPage } from '../pages/RemoveLiquidity';
import { CreateOvenPage } from '../pages/CreateOven';
import { HomePage } from '../pages/Home';
import { CashToTokenPage } from '../pages/CashToToken';

export const routes: ComponentRoute[] = [
  {
    component: CashToTokenPage,
    path: '/cash-to-token',
  },
  {
    component: RemoveLiquidityPage,
    path: '/remove-liquidity',
  },
  {
    component: AddLiquidityPage,
    path: '/add-liquidity',
  },
  {
    component: CreateOvenPage,
    path: '/create',
  },
  {
    component: HomePage,
    path: '/',
  },
];
