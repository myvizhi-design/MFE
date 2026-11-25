import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, Routes } from 'react-router';
import type { RemoteAppProps } from '@mfe/contracts';
import { RequireRole } from '@mfe/auth';
import { Alert } from '@mfe/ui';
import { UserListPage } from './pages/UserListPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UserFormPage } from './pages/UserFormPage';
import './styles.css';

// Each remote owns its server-state cache: no hidden coupling to the shell's.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

const adminOnly = <Alert tone="amber">Only administrators can create or edit users.</Alert>;

/** Routes are RELATIVE: the shell mounts this at /users/*, standalone mounts it at /*. */
export default function UsersApp({ basePath }: RemoteAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* data-mfe = CSS scope root (see styles.css). Keep it the outermost element. */}
      <div data-mfe="users">
        <Routes>
          <Route index element={<UserListPage />} />
          <Route
            path="new"
            element={
              <RequireRole roles={['admin']} fallback={adminOnly}>
                <UserFormPage mode="create" />
              </RequireRole>
            }
          />
          <Route path=":id" element={<UserDetailPage />} />
          <Route
            path=":id/edit"
            element={
              <RequireRole roles={['admin']} fallback={adminOnly}>
                <UserFormPage mode="edit" />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}
