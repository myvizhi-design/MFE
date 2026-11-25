import type { ModuleManifest } from '@mfe/contracts';

const manifest: ModuleManifest = {
  name: 'dashboard',
  title: 'Overview',
  order: 0,
  // no `roles`: every signed-in user can open it
  nav: [{ label: 'Dashboard', path: '', icon: 'home' }],
};

export default manifest;
