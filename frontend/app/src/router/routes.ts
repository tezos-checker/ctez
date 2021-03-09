import { ComponentRoute } from '../interfaces/router';
import { AddLiquidityPage } from '../pages/AddLiquidity';
import { CreateOvenPage } from '../pages/CreateOvenPage';
import { HomePage } from '../pages/Home';

export const routes: ComponentRoute[] = [
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
