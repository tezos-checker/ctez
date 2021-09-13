import { ComponentRoute } from '../interfaces';
import HomePage from '../pages/home';
import OvensPage from '../pages/ovens';
import OvenIdPage from '../pages/ovens/[ovenId]';
import TradePage from '../pages/trade';

export const routes: ComponentRoute[] = [
  {
    path: ['/ovens/mine', '/ovens/create'],
    Component: <OvensPage />,
    exact: true,
  },
  {
    path: '/ovens/:id',
    Component: <OvenIdPage />,
  },
  {
    path: '/ovens',
    Component: <OvensPage />,
    exact: true,
  },
  {
    path: '/trade',
    Component: <TradePage />,
    exact: true,
  },
  // ? Default path must always be at the end
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];
