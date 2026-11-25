import { Navigate, useLocation, useNavigate } from 'react-router';
import { LoginForm, useAuth } from '@mfe/auth';
import { PageLoader } from '@mfe/ui';

export function LoginPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  if (status === 'loading') return <PageLoader label="Restoring your session…" />;
  if (status === 'authenticated') return <Navigate to={from} replace />;

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600">A</span>
          Admin Portal
        </span>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">One portal, independent modules.</h2>
          <p className="mt-3 max-w-md text-slate-300">
            Each section of this portal is a micro-frontend that is built and deployed on its own,
            sharing one secure session.
          </p>
        </div>
        <p className="text-xs text-slate-400">Auth: JWT access + rotating refresh tokens</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 mb-8 text-sm text-slate-500">Use your administrator account.</p>
          <LoginForm onSuccess={() => navigate(from, { replace: true })} />
        </div>
      </div>
    </div>
  );
}
