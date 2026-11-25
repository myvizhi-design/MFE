import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { useLocation } from 'react-router';
import type { RemoteAppProps } from '@mfe/contracts';
import { useAuth } from '@mfe/auth';
import { ErrorBoundary, PageLoader } from '@mfe/ui';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import type { LoadedModule } from './ModulesProvider';
import { loadRemoteApp } from './registry';

const cache = new Map<string, LazyExoticComponent<ComponentType<RemoteAppProps>>>();

function getRemoteApp(name: string) {
  let Comp = cache.get(name);
  if (!Comp) {
    Comp = lazy(() =>
      loadRemoteApp(name).catch((e: unknown) => {
        cache.delete(name); // allow a retry after a transient failure
        throw e;
      }),
    );
    cache.set(name, Comp);
  }
  return Comp;
}

/** Mounts one remote under its basePath with role guard, Suspense and an error boundary. */
export function RemoteModule({ module }: { module: LoadedModule }) {
  const { hasRole } = useAuth();
  const { pathname } = useLocation();
  const title = module.manifest?.title ?? module.name;

  if (module.manifest?.roles && !hasRole(...module.manifest.roles)) {
    return <ForbiddenPage />;
  }

  if (module.error) {
    return (
      <ErrorBoundary name={title} resetKey={pathname}>
        <Throw message={module.error} />
      </ErrorBoundary>
    );
  }

  const RemoteApp = getRemoteApp(module.name);
  return (
    <ErrorBoundary name={title} resetKey={module.name}>
      <Suspense fallback={<PageLoader label={`Loading ${title}…`} />}>
        <RemoteApp basePath={module.basePath} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Throw({ message }: { message: string }): never {
  throw new Error(message);
}
