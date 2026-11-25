import { Link, useNavigate, useParams } from 'react-router';
import { getErrorMessage, RequireRole } from '@mfe/auth';
import { Alert, Button, Card, Icon, PageLoader } from '@mfe/ui';
import { useUser } from '../api/users.api';
import { RoleBadge } from '../components/RoleBadge';

export function UserDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: user, isPending, error } = useUser(id);

  if (!Number.isFinite(id)) return <Alert>Invalid user id.</Alert>;
  if (isPending) return <PageLoader label="Loading user…" />;
  if (error || !user) return <Alert>{error ? getErrorMessage(error) : 'User not found.'}</Alert>;

  const rows: Array<[string, string]> = [
    ['Username', `@${user.username}`],
    ['Email', user.email],
    ['Phone', user.phone || '—'],
    ['Age', String(user.age)],
    ['Gender', user.gender],
    ['Company', [user.company?.title, user.company?.name].filter(Boolean).join(' · ') || '—'],
    ['Department', user.company?.department ?? '—'],
    ['Location', [user.address?.city, user.address?.country].filter(Boolean).join(', ') || '—'],
  ];

  return (
    <div className="space-y-6">
      <Link to=".." className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <Icon name="chevron-left" className="size-4" /> Back to users
      </Link>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 p-6">
          <img src={user.image} alt="" className="size-20 rounded-full bg-slate-100 ring-4 ring-brand-50" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <RoleBadge role={user.role} /> ID #{user.id}
            </div>
          </div>
          <RequireRole roles={['admin']}>
            <Button onClick={() => navigate('edit')}>Edit user</Button>
          </RequireRole>
        </div>
        <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
              <dd className="mt-1 text-sm text-slate-900 capitalize first-letter:uppercase">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
