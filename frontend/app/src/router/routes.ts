import { ComponentRoute } from '../interfaces/router';
import { AddLiquidityPage } from '../pages/AddLiquidity';
import { RemoveLiquidityPage } from '../pages/RemoveLiquidity';
import { CreateOvenPage } from '../pages/CreateOvenPage';
import { HomePage } from '../pages/Home';

export const routes: ComponentRoute[] = [
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
