import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_GRADE_OVERVIEW } from '@/lib/mock';

export interface GradeItem {
  itemId: number;
  itemName: string;
  grade: number | null;
  gradeMax: number;
  percentage: number | null;
}

export interface CourseGrades {
  courseId: number;
  courseName: string;
  items: GradeItem[];
  courseTotal: number | null;
}

export function useGrades(courseId: number) {
  const demoQuery = useQuery<CourseGrades>({
    queryKey: ['grades', 'demo', courseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const found = MOCK_GRADE_OVERVIEW.find((g) => g.courseId === courseId);
      if (found) return found;
      throw new Error(`Grades for course ${courseId} not found`);
    },
    enabled: isDemoMode && courseId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CourseGrades>({
    queryKey: ['grades', courseId],
    queryFn: () => apiFetch<CourseGrades>(`/api/moodle/grades?courseId=${courseId}`),
    enabled: !isDemoMode && courseId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}

export function useGradeOverview() {
  const demoQuery = useQuery<CourseGrades[]>({
    queryKey: ['gradeOverview', 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_GRADE_OVERVIEW;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CourseGrades[]>({
    queryKey: ['gradeOverview'],
    queryFn: () => apiFetch<CourseGrades[]>('/api/moodle/grades'),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}
