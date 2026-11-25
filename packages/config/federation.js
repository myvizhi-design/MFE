/**
 * Single source of truth for dependencies shared between the shell (host)
 * and every remote. Singletons guarantee ONE React tree, ONE router context
 * and ONE auth session across all micro-frontends.
 *
 * Rule: never add a remote-specific library here — only things that must be
 * a single instance at runtime.
 */
export const sharedDeps = {
  react: { singleton: true, requiredVersion: '^19.3.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.3.0' },
  'react-router': { singleton: true, requiredVersion: '^8.5.0' },
  '@tanstack/react-query': { singleton: true, requiredVersion: '^5.108.0' },
  '@mfe/auth': { singleton: true, requiredVersion: '^1.0.0' },
};

/** Dev/preview origin of each app. Override per environment with VITE_PUBLIC_URL. */
export const ports = {
  shell: 3000,
  users: 3001,
  dashboard: 3002,
};
