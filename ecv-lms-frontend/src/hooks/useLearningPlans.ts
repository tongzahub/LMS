import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_LEARNING_PLANS } from '@/lib/mock';

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
  const demoQuery = useQuery<LearningPlan[]>({
    queryKey: ['learningPlans', 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_LEARNING_PLANS;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<LearningPlan[]>({
    queryKey: ['learningPlans'],
    queryFn: () => apiFetch<LearningPlan[]>('/api/moodle/learning-plans'),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function usePlanDetail(planId: number) {
  const demoQuery = useQuery<PlanDetail>({
    queryKey: ['learningPlan', 'demo', planId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const plan = MOCK_LEARNING_PLANS.find((p) => p.id === planId);
      if (!plan) throw new Error(`Plan ${planId} not found`);
      return {
        ...plan,
        competencies: [
          {
            competencyId: 1011,
            competencyName: 'การเขียนโปรแกรมและพัฒนาซอฟต์แวร์',
            currentProficiency: {
              id: 3,
              name: 'ปานกลาง (Intermediate)',
              sortOrder: 3,
              isDefault: false,
              isProficient: true,
            },
            requiredProficiency: {
              id: 4,
              name: 'ชำนาญการ (Proficient)',
              sortOrder: 4,
              isDefault: false,
              isProficient: true,
            },
            linkedCourses: [
              { courseId: 1, courseName: 'Introduction to Programming with Python', progress: 60 },
              { courseId: 2, courseName: 'Full-Stack Web Development with React & Node.js', progress: 35 },
            ],
            evidence: [],
          },
          {
            competencyId: 2021,
            competencyName: 'การทำงานเป็นทีม',
            currentProficiency: null,
            requiredProficiency: {
              id: 4,
              name: 'ชำนาญการ (Proficient)',
              sortOrder: 4,
              isDefault: false,
              isProficient: true,
            },
            linkedCourses: [],
            evidence: [],
          },
        ],
      };
    },
    enabled: isDemoMode && planId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<PlanDetail>({
    queryKey: ['learningPlan', planId],
    queryFn: () => apiFetch<PlanDetail>(`/api/moodle/learning-plans/${planId}`),
    enabled: !isDemoMode && planId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
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
