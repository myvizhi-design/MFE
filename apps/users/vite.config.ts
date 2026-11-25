import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { ports, sharedDeps } from '@mfe/config/federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where this remote is served from. Absolute so its chunks load correctly inside the shell.
  const publicUrl = env.VITE_PUBLIC_URL || `http://localhost:${ports.users}/`;

  return {
    base: publicUrl,
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'users', // must match the registry entry and manifest.name
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx',
          './manifest': './src/manifest.ts',
        },
        shared: sharedDeps,
        dts: false,
      }),
    ],
    server: { port: ports.users, strictPort: true, origin: publicUrl.replace(/\/$/, ''), cors: true },
    preview: { port: ports.users, strictPort: true, cors: true },
    build: { target: 'esnext' },
  };
});
