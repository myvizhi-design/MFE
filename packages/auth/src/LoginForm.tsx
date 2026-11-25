import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@mfe/contracts';
import { Alert, Button, Input } from '@mfe/ui';
import { useAuth } from './AuthProvider';
import { getErrorMessage } from './apiClient';

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Public DummyJSON demo accounts, one per role. Remove when wiring a real backend. */
const DEMO_ACCOUNTS = [
  { role: 'admin', username: 'emilys', password: 'emilyspass' },
  { role: 'moderator', username: 'oliviaw', password: 'oliviawpass' },
  { role: 'user', username: 'averyp', password: 'averyppass' },
] as const;

export function LoginForm({ onSuccess }: { onSuccess?: (user: User) => void }) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const user = await login(values);
      onSuccess?.(user);
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError && <Alert>{serverError}</Alert>}
      <Input
        label="Username"
        autoComplete="username"
        autoFocus
        required
        error={errors.username?.message}
        {...register('username')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Sign in
      </Button>

      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
        <p className="mb-2 font-medium text-slate-700">Demo accounts (DummyJSON)</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.username}
              type="button"
              className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-300 hover:bg-brand-50 hover:ring-brand-200"
              onClick={() => {
                setValue('username', a.username, { shouldValidate: true });
                setValue('password', a.password, { shouldValidate: true });
              }}
            >
              <span className="font-medium capitalize">{a.role}</span> · {a.username}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
