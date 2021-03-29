export interface BaseRoute {
  path: string;
  component: React.ComponentClass<any, any> | React.FunctionComponent<any>;
  props?: unknown;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
