import { Route, Routes } from 'react-router';
import { RequireAuth } from '@mfe/auth';
import { PageLoader } from '@mfe/ui';
import { AppLayout } from '../layout/AppLayout';
import { useModules } from '../mfe/ModulesProvider';
import { RemoteModule } from '../mfe/RemoteModule';
import { LoginPage } from '../pages/LoginPage';
import { HomeRedirect } from '../pages/HomeRedirect';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Route map
 *   /login                public
 *   /                     -> first module the user may open
 *   /<module>/*           remote micro-frontend (owns everything below its basePath)
 *   /forbidden, *         shell pages
 */
export function AppRoutes() {
  const { status, modules } = useModules();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomeRedirect />} />
        {modules.map((m) => (
          <Route key={m.name} path={`${m.basePath}/*`} element={<RemoteModule module={m} />} />
        ))}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route
          path="*"
          element={status === 'loading' ? <PageLoader label="Loading modules…" /> : <NotFoundPage />}
        />
      </Route>
    </Routes>
  );
}
