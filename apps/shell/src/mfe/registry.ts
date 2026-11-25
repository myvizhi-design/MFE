import { loadRemote, registerRemotes } from '@module-federation/runtime';
import type {
  ModuleManifest,
  RemoteAppModule,
  RemoteDefinition,
  RemoteManifestModule,
} from '@mfe/contracts';

/** Fetch the runtime list of remotes (one JSON per environment, no shell rebuild needed). */
export async function fetchRegistry(): Promise<RemoteDefinition[]> {
  const url = import.meta.env.VITE_MFE_REGISTRY_URL || '/mfe.registry.json';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load module registry (${res.status})`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Module registry must be a JSON array');
  return data.filter(
    (d): d is RemoteDefinition =>
      typeof d?.name === 'string' && typeof d?.entry === 'string' && typeof d?.basePath === 'string',
  );
}

export function registerAll(defs: RemoteDefinition[]) {
  registerRemotes(
    defs.map((d) => ({ name: d.name, entry: d.entry, type: 'module' })),
    { force: false },
  );
}

export async function loadManifest(name: string): Promise<ModuleManifest> {
  const mod = await loadRemote<RemoteManifestModule>(`${name}/manifest`);
  if (!mod?.default) throw new Error(`Remote "${name}" did not expose ./manifest`);
  return mod.default;
}

export async function loadRemoteApp(name: string): Promise<RemoteAppModule> {
  const mod = await loadRemote<RemoteAppModule>(`${name}/App`);
  if (!mod?.default) throw new Error(`Remote "${name}" did not expose ./App`);
  return mod;
}
