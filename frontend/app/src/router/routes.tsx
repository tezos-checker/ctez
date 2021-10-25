import { lazy } from 'react';
import { ComponentRoute } from '../interfaces';

const FaqPage = lazy(() => import('../pages/faq'));
const HomePage = lazy(() => import('../pages/home'));
const OvensPage = lazy(() => import('../pages/ovens'));
const OvenIdPage = lazy(() => import('../pages/ovens/[ovenId]'));
const TradePage = lazy(() => import('../pages/trade'));

export const routes: ComponentRoute[] = [
  {
    path: '/myovens/:address',
    Component: <OvenIdPage />,
  },
  {
    path: '/myovens',
    Component: <OvensPage />,
    exact: true,
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
  {
    path: '/faq',
    Component: <FaqPage />,
    exact: true,
  },
  // ? Default path must always be at the end
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];
