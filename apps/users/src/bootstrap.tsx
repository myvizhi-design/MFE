/**
 * STANDALONE entry (http://localhost:3001). Not used when loaded by the shell:
 * the shell imports ./App directly and provides auth + router itself.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StandaloneHost } from '@mfe/auth';
import App from './App';
import './standalone.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandaloneHost title="Users" apiBaseUrl={import.meta.env.VITE_API_BASE_URL}>
      <App basePath="/" />
    </StandaloneHost>
  </StrictMode>,
);
