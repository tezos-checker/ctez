export interface BaseRoute {
  path: string | string[];
  props?: unknown;
  Component?: React.ReactNode;
  exact?: boolean;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
