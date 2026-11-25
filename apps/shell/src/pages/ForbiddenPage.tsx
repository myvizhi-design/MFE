import { Link } from 'react-router';
import { useAuth } from '@mfe/auth';
import { homeLinkClass } from './NotFoundPage';

export function ForbiddenPage() {
  const { user } = useAuth();
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-semibold text-brand-600">403</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Access denied</h1>
      <p className="mt-3 text-slate-500">
        Your role <strong className="capitalize">{user?.role}</strong> cannot open this section.
      </p>
      <Link to="/" className={homeLinkClass}>
        Go to home
      </Link>
    </div>
  );
}
