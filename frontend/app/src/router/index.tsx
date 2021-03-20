import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { routes } from './routes';
import { ComponentRoute } from '../interfaces';

const RouteWithSubRoutes = (route: ComponentRoute) => {
  return (
    <Route
      path={route.path}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={(props: any) => <route.component {...props} routes={route?.routes} />}
    />
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </Switch>
    </Router>
  );
};
