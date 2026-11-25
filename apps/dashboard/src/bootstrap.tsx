import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StandaloneHost } from '@mfe/auth';
import App from './App';
import './standalone.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandaloneHost title="Dashboard" apiBaseUrl={import.meta.env.VITE_API_BASE_URL}>
      <App basePath="/" />
    </StandaloneHost>
  </StrictMode>,
);
