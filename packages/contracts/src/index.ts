import type { ComponentType } from 'react';

/* ---------- Identity ---------- */

export type Role = 'admin' | 'moderator' | 'user';

/** Safe, minimal user shape. Never store raw /auth/me (it contains password, ssn, bank...). */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  role: Role;
}

/* ---------- Module Federation contract ---------- */

/** Icon keys understood by @mfe/ui <Icon />. */
export type IconName =
  | 'home'
  | 'users'
  | 'chart'
  | 'settings'
  | 'box'
  | 'cart';

export interface NavItem {
  label: string;
  /** Path relative to the module basePath ('' = module root). */
  path: string;
  icon?: IconName;
  /** If set, only these roles see the item. */
  roles?: Role[];
}

/**
 * Every remote exposes './manifest' with this shape.
 * The shell reads it to build the side menu and guard the module route.
 */
export interface ModuleManifest {
  /** Must equal the federation `name` of the remote. */
  name: string;
  title: string;
  /** Lower number = higher in the side menu. */
  order?: number;
  /** Roles allowed to open the module at all. Omit = any authenticated user. */
  roles?: Role[];
  nav: NavItem[];
}

/** Props the shell passes to every remote's './App'. */
export interface RemoteAppProps {
  /** Absolute URL prefix the module is mounted at, e.g. '/users'. */
  basePath: string;
}

export interface RemoteAppModule {
  default: ComponentType<RemoteAppProps>;
}

export interface RemoteManifestModule {
  default: ModuleManifest;
}

/** One entry of the runtime registry (public/mfe.registry.json in the shell). */
export interface RemoteDefinition {
  name: string;
  /** URL of the remote's remoteEntry.js. */
  entry: string;
  /** Route prefix in the shell, e.g. '/users'. */
  basePath: string;
}
