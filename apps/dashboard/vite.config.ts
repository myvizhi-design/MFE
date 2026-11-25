import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { ports, sharedDeps } from '@mfe/config/federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicUrl = env.VITE_PUBLIC_URL || `http://localhost:${ports.dashboard}/`;

  return {
    base: publicUrl,
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'dashboard',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx',
          './manifest': './src/manifest.ts',
        },
        shared: sharedDeps,
        dts: false,
      }),
    ],
    server: { port: ports.dashboard, strictPort: true, origin: publicUrl.replace(/\/$/, ''), cors: true },
    preview: { port: ports.dashboard, strictPort: true, cors: true },
    build: { target: 'esnext' },
  };
});
