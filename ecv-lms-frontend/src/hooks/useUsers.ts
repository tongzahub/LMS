import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_USERS } from '@/lib/mock';

export interface UserListItem {
  id: number;
  cognitoSub: string;
  email: string;
  firstname: string;
  lastname: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  status: 'active' | 'suspended' | 'archived';
  enrolledCoursesCount: number;
  lastLogin: string | null;
  createdAt: string;
  cohorts: string[];
}

export interface UserFilters {
  field?: string;
  value?: string;
}

export interface CreateUserParams {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password?: string;
  auth?: string;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  failures: { row: number; email: string; reason: string }[];
}

export function useUsers(filters?: UserFilters) {
  const params = new URLSearchParams();
  if (filters?.field) params.set('field', filters.field);
  if (filters?.value) params.set('value', filters.value);
  const qs = params.toString();

  const demoQuery = useQuery<UserListItem[]>({
    queryKey: ['users', 'demo', filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      if (filters?.field && filters?.value) {
        const val = filters.value.toLowerCase();
        return MOCK_USERS.filter((u) => {
          const field = filters.field as keyof UserListItem;
          const fieldValue = u[field];
          return String(fieldValue).toLowerCase().includes(val);
        });
      }
      return MOCK_USERS;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<UserListItem[]>({
    queryKey: ['users', filters],
    queryFn: () => apiFetch<UserListItem[]>(`/api/moodle/users${qs ? `?${qs}` : ''}`),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserListItem, Error, CreateUserParams>({
    mutationFn: (params) =>
      apiFetch<UserListItem>('/api/moodle/users', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkImportUsers() {
  const queryClient = useQueryClient();

  return useMutation<ImportResult, Error, CreateUserParams[]>({
    mutationFn: (users) =>
      apiFetch<ImportResult>('/api/moodle/users', {
        method: 'POST',
        body: JSON.stringify({ bulk: true, users }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; data: Partial<CreateUserParams> }>({
    mutationFn: ({ id, data }) =>
      apiFetch<void>(`/api/moodle/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/moodle/users/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/moodle/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ suspended: 0 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; mode: 'archive' | 'delete'; exportData?: boolean }>({
    mutationFn: ({ id, mode, exportData }) =>
      apiFetch<void>(`/api/moodle/users/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ mode, exportData }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: number; role: 'ADMIN' | 'TEACHER' | 'STUDENT' }>({
    mutationFn: ({ userId, role }) =>
      apiFetch<void>(`/api/moodle/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
