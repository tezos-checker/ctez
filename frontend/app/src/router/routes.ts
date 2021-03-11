import { ComponentRoute } from '../interfaces/router';
import { MyOvenPage } from '../pages/MyOvenPage';
import { Uniswap } from '../pages/Uniswap';
import { AddLiquidityPage } from '../pages/Uniswap/AddLiquidity';
import { CashToTokenPage } from '../pages/Uniswap/CashToToken';
import { CreateOvenPage } from '../pages/Uniswap/CreateOven';
import { RemoveLiquidityPage } from '../pages/Uniswap/RemoveLiquidity';
import { TokenToCashPage } from '../pages/Uniswap/TokenToCash';

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
    component: Uniswap,
    path: '/uniswap',
  },
  {
    component: MyOvenPage,
    path: '/',
  },
];
