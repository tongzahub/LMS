import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

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
  return useQuery<CompetencyFramework[]>({
    queryKey: ['competencyFrameworks'],
    queryFn: () => apiFetch<CompetencyFramework[]>('/api/moodle/competencies'),
  });
}

export function useFrameworkDetail(frameworkId: number) {
  return useQuery<CompetencyFramework>({
    queryKey: ['competencyFramework', frameworkId],
    queryFn: () => apiFetch<CompetencyFramework>(`/api/moodle/competencies?frameworkId=${frameworkId}`),
    enabled: frameworkId > 0,
  });
}

export function useCompetencies(frameworkId: number) {
  return useQuery<Competency[]>({
    queryKey: ['competencies', frameworkId],
    queryFn: () => apiFetch<Competency[]>(`/api/moodle/competencies?frameworkId=${frameworkId}`),
    enabled: frameworkId > 0,
  });
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
  return useQuery<PlanTemplate[]>({
    queryKey: ['planTemplates'],
    queryFn: () => apiFetch<PlanTemplate[]>('/api/moodle/competencies/templates'),
  });
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
