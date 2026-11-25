import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@mfe/auth';
import { ModulesProvider } from '../mfe/ModulesProvider';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <AuthProvider
      apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
      accessTokenTtlMinutes={Number(import.meta.env.VITE_ACCESS_TOKEN_TTL_MIN) || 30}
    >
      <ModulesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ModulesProvider>
    </AuthProvider>
  );
}
