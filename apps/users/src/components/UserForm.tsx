import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Input, Select } from '@mfe/ui';
import { userSchema, type UserFormValues } from '../schemas/user.schema';

interface Props {
  defaultValues: UserFormValues;
  submitLabel: string;
  serverError?: string | null;
  /** Disable submit until something changed (edit forms). */
  requireChanges?: boolean;
  onSubmit: (values: UserFormValues) => Promise<unknown>;
  onCancel: () => void;
}

export function UserForm({ defaultValues, submitLabel, serverError, requireChanges, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
    mode: 'onTouched',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && <Alert>{serverError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="First name" required autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last name" required autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        <Input label="Username" required autoComplete="off" error={errors.username?.message} {...register('username')} />
        <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          hint="Optional. Digits, spaces, + ( ) -"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Age"
          type="number"
          inputMode="numeric"
          required
          error={errors.age?.message}
          {...register('age', { valueAsNumber: true })}
        />
        <Select
          label="Gender"
          required
          error={errors.gender?.message}
          options={[
            { value: 'female', label: 'Female' },
            { value: 'male', label: 'Male' },
            { value: 'other', label: 'Other' },
          ]}
          {...register('gender')}
        />
        <Select
          label="Role"
          required
          error={errors.role?.message}
          options={[
            { value: 'user', label: 'User' },
            { value: 'moderator', label: 'Moderator' },
            { value: 'admin', label: 'Admin' },
          ]}
          {...register('role')}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={requireChanges && !isDirty}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
