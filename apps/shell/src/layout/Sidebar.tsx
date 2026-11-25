import { NavLink } from 'react-router';
import { useAuth } from '@mfe/auth';
import { cn, Icon } from '@mfe/ui';
import { useModules } from '../mfe/ModulesProvider';

function joinPath(base: string, path: string) {
  return path ? `${base}/${path}`.replace(/\/+/g, '/') : base;
}

/** Side menu built entirely from remote manifests, filtered by the user's role. */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { hasRole } = useAuth();
  const { status, modules } = useModules();

  const visible = modules.filter((m) => !m.manifest?.roles || hasRole(...m.manifest.roles));

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-900/50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-slate-300 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="flex items-center gap-2 text-base font-semibold text-white">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm">A</span>
            Admin Portal
          </span>
          <button
            type="button"
            className="rounded-md p-1 hover:bg-sidebar-hover lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {status === 'loading' && <p className="px-3 text-sm text-slate-400">Loading modules…</p>}
          {visible.map((m) => (
            <div key={m.name}>
              <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {m.manifest?.title ?? m.name}
              </p>
              {m.manifest ? (
                <ul className="space-y-1">
                  {m.manifest.nav
                    .filter((item) => !item.roles || hasRole(...item.roles))
                    .map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={joinPath(m.basePath, item.path)}
                          end={item.path === '' && m.manifest!.nav.length > 1}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              isActive ? 'bg-brand-600 text-white' : 'hover:bg-sidebar-hover hover:text-white',
                            )
                          }
                        >
                          <Icon name={item.icon ?? 'box'} className="size-5 shrink-0" />
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 px-3 text-xs text-amber-300">
                  <Icon name="alert" className="size-4" /> Module unavailable
                </p>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
