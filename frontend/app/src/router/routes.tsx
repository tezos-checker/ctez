import { ComponentRoute } from '../interfaces';
import HomePage from '../pages/home';
import OvensPage from '../pages/ovens';
import OvenIdPage from '../pages/ovens/[ovenId]';

export const routes: ComponentRoute[] = [
  {
    path: '/ovens/:id',
    Component: <OvenIdPage />,
  },
  {
    path: ['/ovens', '/ovens/mine', '/ovens/create'],
    Component: <OvensPage />,
  },
  // ? Default path must always be at the end
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];
