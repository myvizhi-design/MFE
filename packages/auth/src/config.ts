export interface AuthConfig {
  /** API origin, e.g. https://dummyjson.com */
  apiBaseUrl: string;
  /** Access-token lifetime requested at login/refresh. Set to 1 to watch silent refresh happen. */
  accessTokenTtlMinutes: number;
}

export const authConfig: AuthConfig = {
  apiBaseUrl: 'https://dummyjson.com',
  accessTokenTtlMinutes: 30,
};

export function configureAuth(partial: Partial<AuthConfig>) {
  Object.assign(authConfig, partial);
}
