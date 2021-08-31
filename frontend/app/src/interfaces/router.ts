export interface BaseRoute {
  path: string;
  props?: unknown;
  Component?: React.ReactNode;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
