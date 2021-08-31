import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { routes } from './routes';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        {routes.map((route) => (
          <Route key={route.path} path={route.path}>
            {route.Component}
          </Route>
        ))}
      </Switch>
    </Router>
  );
};
