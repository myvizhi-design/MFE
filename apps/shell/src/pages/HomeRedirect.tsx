import { Navigate } from 'react-router';
import { useAuth } from '@mfe/auth';
import { PageLoader } from '@mfe/ui';
import { useModules } from '../mfe/ModulesProvider';
import { NotFoundPage } from './NotFoundPage';

/** Sends the user to the first module (by manifest order) their role can open. */
export function HomeRedirect() {
  const { hasRole } = useAuth();
  const { status, modules } = useModules();

  if (status === 'loading') return <PageLoader label="Loading modules…" />;
  const first = modules.find((m) => m.manifest && (!m.manifest.roles || hasRole(...m.manifest.roles)));
  return first ? <Navigate to={first.basePath} replace /> : <NotFoundPage />;
}
