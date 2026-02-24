import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_COURSES, MOCK_COURSE_DETAILS, MOCK_COURSE_SECTIONS } from '@/lib/mock';

export interface Course {
  id: number;
  shortname: string;
  fullname: string;
  summary: string;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  instructorName: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language?: string;
  credits?: number;
  enrolledCount: number;
  startDate: string;
  endDate?: string;
  visible: boolean;
}

export interface CourseDetail extends Course {
  prerequisites: Course[];
  enrollmentMethods: { type: string; enabled: boolean }[];
  completionCriteria: { type: string; description: string }[];
  competencies: { id: number; name: string }[];
  tags: string[];
  maxEnrollment?: number;
}

export interface CourseModule {
  id: number;
  name: string;
  modname: string;
  description?: string;
  url?: string;
  completionState: 'not_started' | 'in_progress' | 'completed';
  gradeWeight?: number;
  estimatedDuration?: string;
  available: boolean;
  prerequisiteMessage?: string;
}

export interface CourseSection {
  id: number;
  name: string;
  summary: string;
  sectionNumber: number;
  visible: boolean;
  learningObjectives?: string[];
  modules: CourseModule[];
}

export interface CourseListOptions {
  category?: number;
  search?: string;
}

export function useCourses(options?: CourseListOptions) {
  const params = new URLSearchParams();
  if (options?.category) params.set('category', String(options.category));
  if (options?.search) params.set('search', options.search);
  const qs = params.toString();

  const demoQuery = useQuery<Course[]>({
    queryKey: ['courses', 'demo', options],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let result = MOCK_COURSES;
      if (options?.category) {
        result = result.filter((c) => c.categoryId === options.category);
      }
      if (options?.search) {
        const q = options.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.fullname.toLowerCase().includes(q) ||
            c.shortname.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q),
        );
      }
      return result;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<Course[]>({
    queryKey: ['courses', options],
    queryFn: () => apiFetch<Course[]>(`/api/moodle/courses${qs ? `?${qs}` : ''}`),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useCourseDetail(courseId: number) {
  const demoQuery = useQuery<CourseDetail>({
    queryKey: ['course', 'demo', courseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const detail = MOCK_COURSE_DETAILS[courseId];
      if (detail) return detail;
      const base = MOCK_COURSES.find((c) => c.id === courseId);
      if (base) {
        return {
          ...base,
          prerequisites: [],
          enrollmentMethods: [{ type: 'manual', enabled: true }],
          completionCriteria: [],
          competencies: [],
          tags: [],
        };
      }
      throw new Error(`Course ${courseId} not found`);
    },
    enabled: isDemoMode && courseId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CourseDetail>({
    queryKey: ['course', courseId],
    queryFn: () => apiFetch<CourseDetail>(`/api/moodle/courses/${courseId}`),
    enabled: !isDemoMode && courseId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useCourseContents(courseId: number) {
  const demoQuery = useQuery<CourseSection[]>({
    queryKey: ['courseContents', 'demo', courseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_COURSE_SECTIONS[courseId] ?? [];
    },
    enabled: isDemoMode && courseId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CourseSection[]>({
    queryKey: ['courseContents', courseId],
    queryFn: () => apiFetch<CourseSection[]>(`/api/moodle/courses/${courseId}/contents`),
    enabled: !isDemoMode && courseId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export interface CreateCourseParams {
  fullname: string;
  shortname: string;
  summary?: string;
  categoryId: number;
  format: 'weeks' | 'topics';
  startDate?: string;
  endDate?: string;
  visible: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language?: string;
  credits?: number;
  duration?: string;
  tags?: string[];
  maxEnrollment?: number;
  sections?: { name: string; summary: string }[];
  competencyIds?: number[];
  enrollmentMethods?: { type: string; enabled: boolean; key?: string; capacity?: number }[];
  completionCriteria?: { type: string; value?: string }[];
}

export interface UpdateCourseParams extends Partial<CreateCourseParams> {
  id: number;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CreateCourseParams>({
    mutationFn: (params) =>
      apiFetch<Course>('/api/moodle/courses', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateCourseParams>({
    mutationFn: ({ id, ...data }) =>
      apiFetch<void>(`/api/moodle/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });
}
