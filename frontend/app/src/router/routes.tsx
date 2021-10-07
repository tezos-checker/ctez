import { ComponentRoute } from '../interfaces';
import FaqPage from '../pages/faq';
import HomePage from '../pages/home';
import OvensPage from '../pages/ovens';
import OvenIdPage from '../pages/ovens/[ovenId]';
import TradePage from '../pages/trade';

export const routes: ComponentRoute[] = [
  {
    path: '/myovens/:ovenId',
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
