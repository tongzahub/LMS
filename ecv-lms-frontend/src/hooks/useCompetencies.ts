import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_FRAMEWORKS, MOCK_COMPETENCIES, MOCK_TEMPLATES } from '@/lib/mock';

export interface CompetencyFramework {
  id: number;
  shortname: string;
  name: string;
  description: string;
  competencyCount: number;
  linkedCourseCount: number;
  proficiencyScale: ProficiencyLevel[];
}

export interface ProficiencyLevel {
  id: number;
  name: string;
  sortOrder: number;
  isDefault: boolean;
  isProficient: boolean;
}

export interface Competency {
  id: number;
  shortname: string;
  name: string;
  description: string;
  frameworkId: number;
  parentId: number | null;
  sortOrder: number;
  children: Competency[];
}

export interface PlanTemplate {
  id: number;
  name: string;
  description: string;
  dueDateMode: 'fixed' | 'relative';
  dueDate?: string;
  relativeDueDays?: number;
  competencies: TemplateCompetency[];
  assignedUserCount: number;
  assignedCohortCount: number;
  status: 'draft' | 'active';
}

export interface TemplateCompetency {
  competencyId: number;
  competencyName: string;
  frameworkName: string;
  requiredProficiencyLevel: number;
  sortOrder: number;
}

export interface CreateCompetencyParams {
  shortname: string;
  name: string;
  description?: string;
  frameworkId: number;
  parentId?: number | null;
}

export interface AssignTemplateParams {
  templateId: number;
  userId: number;
}

export function useFrameworks() {
  const demoQuery = useQuery<CompetencyFramework[]>({
    queryKey: ['competencyFrameworks', 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_FRAMEWORKS;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CompetencyFramework[]>({
    queryKey: ['competencyFrameworks'],
    queryFn: () => apiFetch<CompetencyFramework[]>('/api/moodle/competencies'),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useFrameworkDetail(frameworkId: number) {
  const demoQuery = useQuery<CompetencyFramework>({
    queryKey: ['competencyFramework', 'demo', frameworkId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const found = MOCK_FRAMEWORKS.find((f) => f.id === frameworkId);
      if (!found) throw new Error(`Framework ${frameworkId} not found`);
      return found;
    },
    enabled: isDemoMode && frameworkId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CompetencyFramework>({
    queryKey: ['competencyFramework', frameworkId],
    queryFn: () => apiFetch<CompetencyFramework>(`/api/moodle/competencies?frameworkId=${frameworkId}`),
    enabled: !isDemoMode && frameworkId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useCompetencies(frameworkId: number) {
  const demoQuery = useQuery<Competency[]>({
    queryKey: ['competencies', 'demo', frameworkId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_COMPETENCIES[frameworkId] ?? [];
    },
    enabled: isDemoMode && frameworkId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<Competency[]>({
    queryKey: ['competencies', frameworkId],
    queryFn: () => apiFetch<Competency[]>(`/api/moodle/competencies?frameworkId=${frameworkId}`),
    enabled: !isDemoMode && frameworkId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useCreateCompetency() {
  const queryClient = useQueryClient();

  return useMutation<Competency, Error, CreateCompetencyParams>({
    mutationFn: (params) =>
      apiFetch<Competency>('/api/moodle/competencies', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competencies', variables.frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['competencyFrameworks'] });
    },
  });
}

export function useTemplates() {
  const demoQuery = useQuery<PlanTemplate[]>({
    queryKey: ['planTemplates', 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_TEMPLATES;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<PlanTemplate[]>({
    queryKey: ['planTemplates'],
    queryFn: () => apiFetch<PlanTemplate[]>('/api/moodle/competencies/templates'),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useAssignTemplate() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, AssignTemplateParams>({
    mutationFn: (params) =>
      apiFetch('/api/moodle/competencies/templates', {
        method: 'POST',
        body: JSON.stringify({ action: 'assign', ...params }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPlans'] });
      queryClient.invalidateQueries({ queryKey: ['planTemplates'] });
    },
  });
}
