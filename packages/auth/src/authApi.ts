import type { Role, User } from '@mfe/contracts';
import { apiClient } from './apiClient';
import { authConfig } from './config';
import type { TokenPair } from './tokenStore';

export interface Credentials {
  username: string;
  password: string;
}

interface LoginResponse extends TokenPair {
  id: number;
  username: string;
}

/** POST /auth/login -> tokens. Note: the response has NO role; /auth/me is needed for that. */
export async function loginRequest(credentials: Credentials): Promise<TokenPair> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    ...credentials,
    expiresInMins: authConfig.accessTokenTtlMinutes,
  });
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

const ROLES: Role[] = ['admin', 'moderator', 'user'];

/**
 * GET /auth/me -> safe User.
 * The raw payload includes password, ssn, bank and crypto details: we whitelist fields
 * so nothing sensitive is ever kept in memory/state or handed to remotes.
 */
export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<Record<string, unknown>>('/auth/me');
  const role = ROLES.includes(data.role as Role) ? (data.role as Role) : 'user';
  return {
    id: Number(data.id),
    username: String(data.username ?? ''),
    email: String(data.email ?? ''),
    firstName: String(data.firstName ?? ''),
    lastName: String(data.lastName ?? ''),
    image: String(data.image ?? ''),
    role,
  };
}
