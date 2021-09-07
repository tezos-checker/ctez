export interface BaseRoute {
  path: string | string[];
  props?: unknown;
  Component?: React.ReactNode;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
