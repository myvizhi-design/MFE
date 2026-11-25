import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authConfig } from './config';
import { emitAuthEvent } from './events';
import { tokenStore, type TokenPair } from './tokenStore';

/** Normalised error every module can show to users. */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Unexpected error';
}

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    const status = error.response?.status ?? 0;
    const message =
      data?.message ??
      (status === 0 ? 'Network error: the server could not be reached' : error.message);
    return new ApiError(message, status);
  }
  return new ApiError(error instanceof Error ? error.message : 'Unexpected error', 0);
}

/**
 * The ONE HTTP client every module uses for authenticated calls.
 * - adds `Authorization: Bearer <access token>`
 * - on 401: refreshes once (single-flight), retries the request, or ends the session
 */
export const apiClient = axios.create({ timeout: 15_000 });

apiClient.interceptors.request.use((config) => {
  config.baseURL ??= authConfig.apiBaseUrl;
  const token = tokenStore.getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const NO_REFRESH = ['/auth/login', '/auth/refresh'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) throw toApiError(error);
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = NO_REFRESH.some((p) => original?.url?.endsWith(p));

    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      throw toApiError(error);
    }

    original._retry = true;
    try {
      const token = await refreshAccessToken();
      original.headers.set('Authorization', `Bearer ${token}`);
      return await apiClient(original);
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status !== 401) throw retryError;
      tokenStore.clear();
      emitAuthEvent('session-expired');
      throw new ApiError('Your session has expired. Please sign in again.', 401);
    }
  },
);

let refreshInFlight: Promise<string> | null = null;

/**
 * Exchange the refresh token for a new pair. Concurrent callers share one request,
 * so 5 parallel 401s produce exactly 1 refresh call (DummyJSON rotates refresh tokens).
 */
export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= (async () => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) throw new ApiError('No refresh token', 401);
    try {
      // Plain axios (not apiClient) so this call never triggers the 401 interceptor.
      const { data } = await axios.post<TokenPair>(
        `${authConfig.apiBaseUrl}/auth/refresh`,
        { refreshToken, expiresInMins: authConfig.accessTokenTtlMinutes },
        { timeout: 15_000 },
      );
      tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return data.accessToken;
    } catch (e) {
      const err = toApiError(e);
      // DummyJSON answers 403 for an invalid/expired refresh token: treat as logged out.
      throw err.status === 403 ? new ApiError(err.message, 401) : err;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
