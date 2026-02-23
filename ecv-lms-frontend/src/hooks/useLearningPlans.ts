import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface LearningPlan {
  id: number;
  name: string;
  description: string;
  userId: number;
  templateId?: number;
  status: 'draft' | 'waiting_for_review' | 'in_review' | 'active' | 'complete';
  dueDate?: string;
  overallProgress: number;
  createdAt: string;
  completedAt?: string;
}

export interface PlanDetail extends LearningPlan {
  competencies: PlanCompetency[];
}

export interface PlanCompetency {
  competencyId: number;
  competencyName: string;
  currentProficiency: ProficiencyLevel | null;
  requiredProficiency: ProficiencyLevel;
  linkedCourses: { courseId: number; courseName: string; progress: number }[];
  evidence: Evidence[];
}

export interface ProficiencyLevel {
  id: number;
  name: string;
  sortOrder: number;
  isDefault: boolean;
  isProficient: boolean;
}

export interface Evidence {
  id: number;
  description: string;
  url?: string;
  submittedAt: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

export function useMyPlans() {
  return useQuery<LearningPlan[]>({
    queryKey: ['learningPlans'],
    queryFn: () => apiFetch<LearningPlan[]>('/api/moodle/learning-plans'),
  });
}

export function usePlanDetail(planId: number) {
  return useQuery<PlanDetail>({
    queryKey: ['learningPlan', planId],
    queryFn: () => apiFetch<PlanDetail>(`/api/moodle/learning-plans/${planId}`),
    enabled: planId > 0,
  });
}

export function usePlanCompetencies(planId: number) {
  return useQuery<PlanCompetency[]>({
    queryKey: ['planCompetencies', planId],
    queryFn: () => apiFetch<PlanCompetency[]>(`/api/moodle/learning-plans/${planId}`),
    enabled: planId > 0,
    select: (data) => (data as unknown as PlanDetail).competencies ?? (data as unknown as PlanCompetency[]),
  });
}

export function useApprovePlan() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number>({
    mutationFn: (planId) =>
      apiFetch('/api/moodle/learning-plans', {
        method: 'POST',
        body: JSON.stringify({ action: 'approve', planId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPlans'] });
    },
  });
}

export function useGradeCompetency() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { planId: number; competencyId: number; grade: number; note?: string }>({
    mutationFn: ({ planId, ...body }) =>
      apiFetch(`/api/moodle/learning-plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learningPlan', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['planCompetencies', variables.planId] });
    },
  });
}
