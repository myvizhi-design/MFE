import { useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '@mfe/auth';
import { Alert, Card, PageHeader, PageLoader } from '@mfe/ui';
import { useSaveUser, useUser } from '../api/users.api';
import { UserForm } from '../components/UserForm';
import { emptyUser, type UserFormValues } from '../schemas/user.schema';

export function UserFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const id = mode === 'edit' ? Number(useParams().id) : undefined;
  const existing = useUser(id ?? 0);
  const save = useSaveUser(id);

  if (mode === 'edit' && existing.isPending) return <PageLoader label="Loading user…" />;
  if (mode === 'edit' && (existing.error || !existing.data)) {
    return <Alert>{existing.error ? getErrorMessage(existing.error) : 'User not found.'}</Alert>;
  }

  const u = existing.data;
  const defaults: UserFormValues = u
    ? {
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        phone: u.phone ?? '',
        age: u.age,
        gender: (['male', 'female'].includes(u.gender) ? u.gender : 'other') as UserFormValues['gender'],
        role: u.role,
      }
    : emptyUser;

  // One URL segment up: /users/new -> /users, /users/:id/edit -> /users/:id
  const back = () => navigate('..', { relative: 'path' });

  return (
    <div>
      <PageHeader
        title={mode === 'create' ? 'Add user' : `Edit ${u?.firstName} ${u?.lastName}`}
        description="All fields marked * are required. Validation runs on blur and on submit."
      />
      <Card className="p-6">
        <UserForm
          key={u?.id ?? 'new'}
          defaultValues={defaults}
          submitLabel={mode === 'create' ? 'Create user' : 'Save changes'}
          serverError={save.error ? getErrorMessage(save.error) : null}
          requireChanges={mode === 'edit'}
          onCancel={back}
          onSubmit={async (values) => {
            const saved = await save.mutateAsync(values).catch(() => null);
            if (!saved) return;
            navigate(mode === 'create' ? '..' : '../..', {
              relative: 'path',
              state: {
                flash: `${saved.firstName} ${saved.lastName} ${mode === 'create' ? 'created' : 'updated'} (simulated: DummyJSON does not persist writes).`,
              },
            });
          }}
        />
      </Card>
    </div>
  );
}
