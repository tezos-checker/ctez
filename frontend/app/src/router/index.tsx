import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { routes } from './routes';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        {routes.map((route) => (
          <Route
            key={typeof route.path === 'string' ? route.path : route.path[0]}
            path={route.path}
          >
            {route.Component}
          </Route>
        ))}
      </Switch>
    </Router>
  );
};
