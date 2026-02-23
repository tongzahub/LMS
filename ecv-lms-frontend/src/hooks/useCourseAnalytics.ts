import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface StudentProgress {
  userId: number;
  userName: string;
  progress: number;
  grade: number | null;
  lastAccess: string | null;
  atRisk: boolean;
  riskReason?: string;
}

export interface CourseAnalytics {
  enrollmentTrend: { date: string; count: number }[];
  completionRate: number;
  gradeDistribution: { range: string; count: number }[];
  studentProgress: StudentProgress[];
}

export function useCourseAnalytics(courseId: number) {
  return useQuery<CourseAnalytics>({
    queryKey: ['courseAnalytics', courseId],
    queryFn: () =>
      apiFetch<CourseAnalytics>(`/api/moodle/courses/${courseId}/analytics`),
    enabled: courseId > 0,
  });
}
