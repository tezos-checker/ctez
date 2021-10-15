export interface BaseRoute {
  path: string | string[];
  props?: unknown;
  Component?: React.ReactNode;
  exact?: boolean;
  pageTitle?: string;
}

export interface ComponentRoute extends BaseRoute {
  routes?: BaseRoute[];
}
