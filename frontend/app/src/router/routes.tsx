import { lazy } from 'react';
import { ComponentRoute } from '../interfaces';

const FaqPage = lazy(() => import('../pages/faq'));
const HomePage = lazy(() => import('../pages/home'));
const OvensPage = lazy(() => import('../pages/ovens'));
const OvenIdPage = lazy(() => import('../pages/ovens/[ovenId]'));
const TradePage = lazy(() => import('../pages/trade'));

export const routes: ComponentRoute[] = [
  {
    path: '/myovens/:ovenId',
    Component: <OvenIdPage />,
    pageTitle: 'Oven Details',
  },
  {
    path: '/myovens',
    Component: <OvensPage />,
    exact: true,
    pageTitle: 'My Ovens',
  },

  {
    path: '/ovens',
    Component: <OvensPage />,
    exact: true,
    pageTitle: 'All Ovens',
  },
  {
    path: '/trade',
    Component: <TradePage />,
    exact: true,
    pageTitle: 'Trade',
  },
  {
    path: '/faq',
    Component: <FaqPage />,
    exact: true,
    pageTitle: 'FAQ',
  },
  // ? Default path must always be at the end
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];
