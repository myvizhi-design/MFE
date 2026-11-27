import type { ModuleManifest } from '@mfe/contracts';

/** Read by the shell to build the side menu and guard /users/*. Keep it tiny: no heavy imports. */
const manifest: ModuleManifest = {
  name: 'users',
  title: 'User Management',
  order: 10,
  roles: ['admin', 'moderator'],
  // One menu entry: "Add user" lives as a button on the list page (admin only),
  // and the /users/new route stays guarded by RequireRole in App.tsx.
  nav: [{ label: 'All users', path: '', icon: 'users' }],
};

export default manifest;
