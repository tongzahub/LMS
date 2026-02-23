import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

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
  return useQuery<CourseGrades>({
    queryKey: ['grades', courseId],
    queryFn: () => apiFetch<CourseGrades>(`/api/moodle/grades?courseId=${courseId}`),
    enabled: courseId > 0,
  });
}

export function useGradeOverview() {
  return useQuery<CourseGrades[]>({
    queryKey: ['gradeOverview'],
    queryFn: () => apiFetch<CourseGrades[]>('/api/moodle/grades'),
  });
}
