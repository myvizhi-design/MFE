import { Link } from 'react-router';

export const homeLinkClass =
  'mt-8 inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/" className={homeLinkClass}>
        Go to home
      </Link>
    </div>
  );
}
