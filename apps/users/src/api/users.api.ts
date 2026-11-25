import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@mfe/auth';
import type { Role } from '@mfe/contracts';
import type { UserFormValues } from '../schemas/user.schema';

export interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  age: number;
  gender: string;
  role: Role;
  image: string;
  company?: { name?: string; title?: string; department?: string };
  address?: { city?: string; country?: string };
}

export interface UsersPage {
  users: UserRecord[];
  total: number;
  skip: number;
  limit: number;
}

// Only request what we display: /users returns password, ssn, bank... otherwise.
const SELECT = 'id,firstName,lastName,email,username,phone,age,gender,role,image,company,address';

export interface ListParams {
  q: string;
  page: number;
  pageSize: number;
}

/* ---------- raw calls (all under /auth/* = Bearer token required) ---------- */

async function listUsers({ q, page, pageSize }: ListParams): Promise<UsersPage> {
  const params = { limit: pageSize, skip: (page - 1) * pageSize, select: SELECT };
  const url = q ? '/auth/users/search' : '/auth/users';
  const { data } = await apiClient.get<UsersPage>(url, { params: q ? { ...params, q } : params });
  return data;
}

async function getUser(id: number): Promise<UserRecord> {
  const { data } = await apiClient.get<UserRecord>(`/auth/users/${id}`, { params: { select: SELECT } });
  return data;
}

async function createUser(values: UserFormValues): Promise<UserRecord> {
  const { data } = await apiClient.post<UserRecord>('/auth/users/add', values);
  return data;
}

async function updateUser(id: number, values: UserFormValues): Promise<UserRecord> {
  const { data } = await apiClient.put<UserRecord>(`/auth/users/${id}`, values);
  return data;
}

async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/auth/users/${id}`);
}

/* ---------- React Query hooks (what pages use) ---------- */

const keys = {
  all: ['users'] as const,
  list: (p: ListParams) => ['users', 'list', p] as const,
  detail: (id: number) => ['users', 'detail', id] as const,
};

export function useUsers(params: ListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getUser(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useSaveUser(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: UserFormValues) => (id ? updateUser(id, values) : createUser(values)),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
