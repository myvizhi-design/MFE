import type { ModuleManifest } from '@mfe/contracts';

/** Read by the shell to build the side menu and guard /users/*. Keep it tiny: no heavy imports. */
const manifest: ModuleManifest = {
  name: 'users',
  title: 'User Management',
  order: 10,
  roles: ['admin', 'moderator'],
  nav: [
    { label: 'All users', path: '', icon: 'users' },
    { label: 'Add user', path: 'new', icon: 'settings', roles: ['admin'] },
  ],
};

export default manifest;
