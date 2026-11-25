import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import type { ModuleManifest, RemoteDefinition } from '@mfe/contracts';
import { fetchRegistry, loadManifest, registerAll } from './registry';

export interface LoadedModule extends RemoteDefinition {
  manifest: ModuleManifest | null;
  /** Set when the remote is down; the shell keeps working and shows a fallback. */
  error: string | null;
}

interface ModulesState {
  status: 'loading' | 'ready' | 'error';
  modules: LoadedModule[];
  error: string | null;
}

const ModulesContext = createContext<ModulesState>({ status: 'loading', modules: [], error: null });

/**
 * Boot sequence: registry JSON -> register remotes -> load every manifest in parallel.
 * A remote that fails to answer is kept with `error` set instead of breaking the portal.
 */
export function ModulesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModulesState>({ status: 'loading', modules: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const defs = await fetchRegistry();
        registerAll(defs);
        const results = await Promise.allSettled(defs.map((d) => loadManifest(d.name)));
        const modules = defs.map<LoadedModule>((def, i) => {
          const r = results[i];
          if (r.status === 'fulfilled') return { ...def, manifest: r.value, error: null };
          console.error(`[mfe] remote "${def.name}" unavailable`, r.reason);
          return { ...def, manifest: null, error: String((r.reason as Error)?.message ?? r.reason) };
        });
        modules.sort((a, b) => (a.manifest?.order ?? 99) - (b.manifest?.order ?? 99));
        if (!cancelled) setState({ status: 'ready', modules, error: null });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', modules: [], error: (e as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <ModulesContext value={state}>{children}</ModulesContext>;
}

export const useModules = () => use(ModulesContext);
