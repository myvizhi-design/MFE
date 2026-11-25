import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Button, Card } from '@mfe/ui';
import { AuthProvider, useAuth, type AuthProviderProps } from './AuthProvider';
import { RequireAuth } from './guards';
import { LoginForm } from './LoginForm';

/**
 * Lets a remote run on its own (npm run dev -w @mfe/users) with real auth,
 * without the shell. Only used by remotes' standalone bootstrap, never in production.
 */
export function StandaloneHost({
  title,
  children,
  ...authConfig
}: { title: string; children: ReactNode } & Omit<AuthProviderProps, 'children'>) {
  return (
    <AuthProvider {...authConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<StandaloneLogin title={title} />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <StandaloneFrame title={title}>{children}</StandaloneFrame>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function StandaloneFrame({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-between border-b border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
        <span>
          <strong>{title}</strong> standalone dev mode (no shell)
        </span>
        <span className="flex items-center gap-3">
          {user?.username} ({user?.role})
          <Button size="sm" variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </span>
      </div>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}

function StandaloneLogin({ title }: { title: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-4 text-lg font-semibold">{title}: sign in</h1>
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      </Card>
    </div>
  );
}
