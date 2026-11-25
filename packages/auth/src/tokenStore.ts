/**
 * Token storage strategy
 * - Access token: memory only (not readable after reload, not persisted -> smaller XSS window).
 * - Refresh token: sessionStorage so a page reload can silently restore the session.
 *
 * Production recommendation: move the refresh token to an httpOnly, Secure, SameSite cookie
 * issued by your own backend/BFF; then delete the sessionStorage part below.
 */
const REFRESH_KEY = 'mfe.auth.refreshToken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let accessToken: string | null = null;

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: (): string | null => {
    try {
      return storage()?.getItem(REFRESH_KEY) ?? null;
    } catch {
      return null;
    }
  },
  set(tokens: TokenPair) {
    accessToken = tokens.accessToken;
    try {
      storage()?.setItem(REFRESH_KEY, tokens.refreshToken);
    } catch {
      /* storage unavailable: session lives in memory only */
    }
  },
  clear() {
    accessToken = null;
    try {
      storage()?.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
};
