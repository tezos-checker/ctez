import { ComponentRoute } from '../interfaces';
import HomePage from '../pages/home';

export const routes: ComponentRoute[] = [
  {
    path: '/',
    Component: <HomePage />,
  },
  // New routes go here
];
