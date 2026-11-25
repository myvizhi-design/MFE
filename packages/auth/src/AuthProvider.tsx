import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Role, User } from '@mfe/contracts';
import { refreshAccessToken } from './apiClient';
import { fetchCurrentUser, loginRequest, type Credentials } from './authApi';
import { configureAuth, type AuthConfig } from './config';
import { emitAuthEvent, onAuthEvent } from './events';
import { tokenStore } from './tokenStore';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (credentials: Credentials) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface State {
  status: AuthStatus;
  user: User | null;
}

export interface AuthProviderProps extends Partial<AuthConfig> {
  children: ReactNode;
}

/**
 * Mounted ONCE by the shell (or by a remote's standalone dev host).
 * Remotes only call useAuth(): they never render their own provider inside the shell.
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  // Configure synchronously before any child issues a request.
  useState(() => configureAuth(config));

  const [state, setState] = useState<State>(() => ({
    status: tokenStore.getRefreshToken() ? 'loading' : 'unauthenticated',
    user: null,
  }));

  // Boot: restore the session silently with the stored refresh token.
  useEffect(() => {
    if (state.status !== 'loading') return;
    let cancelled = false;
    refreshAccessToken()
      .then(fetchCurrentUser)
      .then((user) => !cancelled && setState({ status: 'authenticated', user }))
      .catch(() => {
        tokenStore.clear();
        if (!cancelled) setState({ status: 'unauthenticated', user: null });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on boot
  }, []);

  // Any module's API call can end the session (refresh failed) -> reflect it here.
  useEffect(
    () => onAuthEvent('session-expired', () => setState({ status: 'unauthenticated', user: null })),
    [],
  );

  const login = useCallback(async (credentials: Credentials) => {
    const tokens = await loginRequest(credentials);
    tokenStore.set(tokens);
    try {
      const user = await fetchCurrentUser();
      setState({ status: 'authenticated', user });
      emitAuthEvent('login');
      return user;
    } catch (e) {
      tokenStore.clear();
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setState({ status: 'unauthenticated', user: null });
    emitAuthEvent('logout');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      hasRole: (...roles) => !!state.user && (roles.length === 0 || roles.includes(state.user.role)),
    }),
    [state, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth() must be used inside <AuthProvider>. In a remote, make sure "@mfe/auth" is a shared singleton.',
    );
  }
  return ctx;
}
