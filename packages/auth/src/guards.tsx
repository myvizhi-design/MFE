import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from '@mfe/contracts';
import { PageLoader } from '@mfe/ui';
import { useAuth } from './AuthProvider';

/** Redirects to the login page (remembering where the user was going) when signed out. */
export function RequireAuth({ children, loginPath = '/login' }: { children: ReactNode; loginPath?: string }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader label="Restoring your session…" />;
  if (status === 'unauthenticated') {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  return children;
}

/** Renders children only for the given roles; otherwise the fallback (default: nothing). */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : fallback;
}
