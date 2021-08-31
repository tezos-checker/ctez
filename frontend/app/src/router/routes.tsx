import { ComponentRoute } from '../interfaces/router';
import { MyOvenPage } from '../pages/old/MyOvenPage';
import { BuySell } from '../pages/old/BuySell';
import { AddLiquidityPage } from '../pages/old/BuySell/AddLiquidity';
import { ConversionPage } from '../pages/old/BuySell/Conversion';
import { CreateOvenPage } from '../pages/old/CreateOven/CreateOven';
import { RemoveLiquidityPage } from '../pages/old/BuySell/RemoveLiquidity';
import { TrackOven } from '../pages/old/TrackOven';
import { Settings } from '../pages/old/Settings';
import HomePage from '../pages/home';

export const routes: ComponentRoute[] = [
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];

export const oldRoutes: any[] = [
  {
    component: ConversionPage,
    path: '/buy-sell/token-to-cash',
    props: {
      formType: 'ctezToTez',
    },
  },
  {
    component: ConversionPage,
    path: '/buy-sell/cash-to-token',
    props: {
      formType: 'tezToCtez',
    },
  },
  {
    component: RemoveLiquidityPage,
    path: '/buy-sell/remove-liquidity',
  },
  {
    component: AddLiquidityPage,
    path: '/buy-sell/add-liquidity',
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
    component: TrackOven,
    path: '/track-oven',
  },
  {
    component: Settings,
    path: '/settings',
  },
  {
    component: MyOvenPage,
    path: '/',
  },
];
