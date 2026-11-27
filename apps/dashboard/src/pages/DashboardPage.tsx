import { useQuery } from '@tanstack/react-query';
import { apiClient, getErrorMessage, useAuth } from '@mfe/auth';
import type { IconName, Role } from '@mfe/contracts';
import { Alert, Badge, Card, Icon, PageHeader, Spinner } from '@mfe/ui';

interface Totals {
  users: number;
  admins: number;
  products: number;
  carts: number;
}

/** `limit=1&select=id` keeps payloads tiny: we only need `total`. */
async function total(path: string, params: Record<string, string> = {}) {
  const { data } = await apiClient.get<{ total: number }>(path, {
    params: { limit: 1, select: 'id', ...params },
  });
  return data.total;
}

async function fetchTotals(): Promise<Totals> {
  const [users, admins, products, carts] = await Promise.all([
    total('/auth/users'),
    total('/auth/users/filter', { key: 'role', value: 'admin' }),
    total('/auth/products'),
    total('/auth/carts'),
  ]);
  return { users, admins, products, carts };
}

const PERMISSIONS: Record<Role, string[]> = {
  admin: ['View dashboard', 'View users', 'Create, edit and delete users'],
  moderator: ['View dashboard', 'View users (read-only)'],
  user: ['View dashboard'],
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isPending, error } = useQuery({ queryKey: ['dashboard', 'totals'], queryFn: fetchTotals });

  const stats: Array<{ label: string; value?: number; icon: IconName }> = [
    { label: 'Total users', value: data?.users, icon: 'users' },
    { label: 'Administrators', value: data?.admins, icon: 'settings' },
    { label: 'Products', value: data?.products, icon: 'box' },
    { label: 'Carts', value: data?.carts, icon: 'cart' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? ''}`}
        description="Live figures from the DummyJSON API, fetched with your access token."
      />

      {error && <Alert>{getErrorMessage(error)}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name={s.icon} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">
                {isPending ? <Spinner className="mt-1 size-5 text-slate-300" /> : (s.value ?? '—').toLocaleString()}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {user && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Your access</h2>
            <Badge tone={user.role === 'admin' ? 'brand' : user.role === 'moderator' ? 'amber' : 'neutral'}>
              {user.role}
            </Badge>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {PERMISSIONS[user.role].map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Roles come from <code className="rounded bg-slate-100 px-1">GET /auth/me</code>. The shell hides menu
            items and blocks routes; each module also checks roles before showing actions.
            This is the test data. Dashboard testing.
          </p>
          <p>Tst the dashboard data</p>
        </Card>
      )}
    </div>
  );
}
