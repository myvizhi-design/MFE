/**
 * Tiny typed event bus for cross-MFE auth events.
 * Because @mfe/auth is a federation singleton, every remote subscribes to the same bus.
 */
export type AuthEvent = 'login' | 'logout' | 'session-expired';

const listeners = new Map<AuthEvent, Set<() => void>>();

export function onAuthEvent(event: AuthEvent, fn: () => void): () => void {
  const set = listeners.get(event) ?? new Set();
  set.add(fn);
  listeners.set(event, set);
  return () => set.delete(fn);
}

export function emitAuthEvent(event: AuthEvent) {
  listeners.get(event)?.forEach((fn) => fn());
}
