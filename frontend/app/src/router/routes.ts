import { ComponentRoute } from '../interfaces/router';
import { MyOvenPage } from '../pages/MyOvenPage';
import { Buy_sell } from '../pages/Buy_sell';
import { AddLiquidityPage } from '../pages/Buy_sell/AddLiquidity';
import { CashToTokenPage } from '../pages/Buy_sell/CashToToken';
import { CreateOvenPage } from '../pages/CreateOven/CreateOven';
import { RemoveLiquidityPage } from '../pages/Buy_sell/RemoveLiquidity';
import { TokenToCashPage } from '../pages/Buy_sell/TokenToCash';

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
    component: Buy_sell,
    path: '/buy_sell',
  },
  {
    component: MyOvenPage,
    path: '/',
  },
];
