import { useModules } from '../mfe/ModulesProvider';

export function Footer() {
  const { modules } = useModules();
  const up = modules.filter((m) => !m.error).length;

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Admin Portal. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${up === modules.length ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden="true"
          />
          {up}/{modules.length} modules online
        </span>
      </div>
    </footer>
  );
}
