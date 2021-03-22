import { ComponentRoute } from '../interfaces/router';
import { MyOvenPage } from '../pages/MyOvenPage';
import { BuySell } from '../pages/BuySell';
import { AddLiquidityPage } from '../pages/BuySell/AddLiquidity';
import { CashToTokenPage } from '../pages/BuySell/CashToToken';
import { CreateOvenPage } from '../pages/CreateOven/CreateOven';
import { RemoveLiquidityPage } from '../pages/BuySell/RemoveLiquidity';
import { TokenToCashPage } from '../pages/BuySell/TokenToCash';

export const routes: ComponentRoute[] = [
  {
    component: TokenToCashPage,
    path: '/token-to-cash',
  },
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
    component: BuySell,
    path: '/buy-sell',
  },
  {
    component: MyOvenPage,
    path: '/',
  },
];
