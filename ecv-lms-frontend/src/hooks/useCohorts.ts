import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface Cohort {
  id: number;
  name: string;
  description: string;
  memberCount?: number;
}

export interface CohortMember {
  cohortid: number;
  userid: number;
}

export function useCohorts() {
  return useQuery<Cohort[]>({
    queryKey: ['cohorts'],
    queryFn: () => apiFetch<Cohort[]>('/api/moodle/cohorts'),
  });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();

  return useMutation<Cohort, Error, { name: string; description?: string }>({
    mutationFn: (params) =>
      apiFetch<Cohort>('/api/moodle/cohorts', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
    },
  });
}

export function useCohortMembers(cohortId: number) {
  return useQuery<CohortMember[]>({
    queryKey: ['cohortMembers', cohortId],
    queryFn: () => apiFetch<CohortMember[]>(`/api/moodle/cohorts?members=${cohortId}`),
    enabled: cohortId > 0,
  });
}

export function useAddCohortMembers() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CohortMember[]>({
    mutationFn: (members) =>
      apiFetch<void>('/api/moodle/cohorts', {
        method: 'PUT',
        body: JSON.stringify({ action: 'add', members }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['cohortMembers'] });
    },
  });
}

export function useRemoveCohortMembers() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CohortMember[]>({
    mutationFn: (members) =>
      apiFetch<void>('/api/moodle/cohorts', {
        method: 'PUT',
        body: JSON.stringify({ action: 'remove', members }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['cohortMembers'] });
    },
  });
}
