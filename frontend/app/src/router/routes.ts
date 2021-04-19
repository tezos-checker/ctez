import { ComponentRoute } from '../interfaces/router';
import { MyOvenPage } from '../pages/MyOvenPage';
import { BuySell } from '../pages/BuySell';
import { AddLiquidityPage } from '../pages/BuySell/AddLiquidity';
import { ConversionPage } from '../pages/BuySell/Conversion';
import { CreateOvenPage } from '../pages/CreateOven/CreateOven';
import { RemoveLiquidityPage } from '../pages/BuySell/RemoveLiquidity';
import { TrackOven } from '../pages/TrackOven';
import { Settings } from '../pages/Settings';

export const routes: ComponentRoute[] = [
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
