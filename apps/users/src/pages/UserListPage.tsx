import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { getErrorMessage, useAuth } from '@mfe/auth';
import { Alert, Button, Card, Icon, PageHeader, Spinner } from '@mfe/ui';
import { useDeleteUser, useUsers } from '../api/users.api';
import { RoleBadge } from '../components/RoleBadge';

const PAGE_SIZE = 10;

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function UserListPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search.trim());
  useEffect(() => setPage(1), [q]);

  const { data, isPending, isFetching, error } = useUsers({ q, page, pageSize: PAGE_SIZE });
  const del = useDeleteUser();
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function onDelete(id: number, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await del.mutateAsync(id);
      setDeleteMsg(`${name} deleted (simulated: DummyJSON does not persist writes).`);
    } catch (e) {
      setDeleteMsg(getErrorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Search, view and manage portal users."
        actions={
          isAdmin && (
            <Button onClick={() => navigate('new')}>
              <Icon name="plus" className="size-4" /> Add user
            </Button>
          )
        }
      />

      <div className="mb-4 space-y-3">
        {flash && <Alert tone="brand">{flash}</Alert>}
        {deleteMsg && <Alert tone="brand">{deleteMsg}</Alert>}
        {error && <Alert>{getErrorMessage(error)}</Alert>}
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative max-w-sm flex-1">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, username…"
              aria-label="Search users"
              className="block w-full rounded-lg border-0 py-2 pr-3 pl-9 text-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-brand-600"
            />
          </div>
          {isFetching && <Spinner className="size-4 text-slate-400" />}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="hidden px-4 py-3 md:table-cell">Company</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Loading users…
                  </td>
                </tr>
              )}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No users match “{q}”.
                  </td>
                </tr>
              )}
              {data?.users.map((u) => {
                const name = `${u.firstName} ${u.lastName}`;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={String(u.id)} className="flex items-center gap-3">
                        <img src={u.image} alt="" className="size-9 rounded-full bg-slate-100" />
                        <span>
                          <span className="block font-medium text-slate-900 hover:text-brand-600">{name}</span>
                          <span className="block text-xs text-slate-500">{u.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">@{u.username}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{u.company?.title ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => navigate(String(u.id))}>
                          View
                        </Button>
                        {isAdmin && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`${u.id}/edit`)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              loading={del.isPending && del.variables === u.id}
                              onClick={() => onDelete(u.id, name)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          <span>
            Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron-left" className="size-4" /> Prev
            </Button>
            <Button size="sm" variant="secondary" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
              Next <Icon name="chevron-right" className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
