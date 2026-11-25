import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { ports, sharedDeps } from '@mfe/config/federation';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      // Remotes are NOT hard-coded: they are registered at runtime from
      // public/mfe.registry.json (see src/mfe/registry.ts), so a module's URL
      // can change per environment without rebuilding the shell.
      remotes: {},
      shared: sharedDeps,
      dts: false,
    }),
  ],
  server: { port: ports.shell, strictPort: true },
  preview: { port: ports.shell, strictPort: true },
  build: { target: 'esnext' },
});
