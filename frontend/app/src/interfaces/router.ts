export interface BaseRoute {
  path: string;
  component: React.ComponentClass | React.FunctionComponent<any>;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
