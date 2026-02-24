import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_COHORTS } from '@/lib/mock';

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
  const demoQuery = useQuery<Cohort[]>({
    queryKey: ['cohorts', 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_COHORTS;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<Cohort[]>({
    queryKey: ['cohorts'],
    queryFn: () => apiFetch<Cohort[]>('/api/moodle/cohorts'),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
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
