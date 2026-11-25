import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, Routes } from 'react-router';
import type { RemoteAppProps } from '@mfe/contracts';
import { DashboardPage } from './pages/DashboardPage';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
});

export default function DashboardApp({ basePath }: RemoteAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div data-mfe="dashboard">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}
