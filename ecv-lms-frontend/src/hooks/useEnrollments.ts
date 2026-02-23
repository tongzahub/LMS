import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface BatchEnrollParams {
  courseIds: number[];
  userIds: number[];
}

export function useEnrollSelf(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { enrollKey?: string }>({
    mutationFn: (params) =>
      apiFetch<void>('/api/moodle/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId, ...params }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useBatchEnroll() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BatchEnrollParams>({
    mutationFn: (params) =>
      apiFetch<void>('/api/moodle/enrollments', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
