import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';

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

const MOCK_ANALYTICS: CourseAnalytics = {
  enrollmentTrend: [
    { date: '2026-01-01', count: 10 },
    { date: '2026-01-08', count: 18 },
    { date: '2026-01-15', count: 25 },
    { date: '2026-01-22', count: 31 },
    { date: '2026-02-01', count: 38 },
    { date: '2026-02-08', count: 42 },
    { date: '2026-02-15', count: 47 },
    { date: '2026-02-22', count: 52 },
  ],
  completionRate: 34,
  gradeDistribution: [
    { range: '0-49', count: 3 },
    { range: '50-59', count: 5 },
    { range: '60-69', count: 8 },
    { range: '70-79', count: 14 },
    { range: '80-89', count: 12 },
    { range: '90-100', count: 10 },
  ],
  studentProgress: [
    {
      userId: 101,
      userName: 'สมชาย ใจดี',
      progress: 85,
      grade: 88,
      lastAccess: '2026-02-23T14:30:00Z',
      atRisk: false,
    },
    {
      userId: 102,
      userName: 'สุมาลี รักเรียน',
      progress: 72,
      grade: 75,
      lastAccess: '2026-02-22T09:15:00Z',
      atRisk: false,
    },
    {
      userId: 103,
      userName: 'วีระชัย ขยันดี',
      progress: 20,
      grade: null,
      lastAccess: '2026-01-30T11:00:00Z',
      atRisk: true,
      riskReason: 'No activity for 24 days',
    },
    {
      userId: 104,
      userName: 'นภาพร เก่งมาก',
      progress: 95,
      grade: 96,
      lastAccess: '2026-02-24T08:00:00Z',
      atRisk: false,
    },
    {
      userId: 105,
      userName: 'ธนพล ช้าไป',
      progress: 15,
      grade: null,
      lastAccess: '2026-01-20T16:45:00Z',
      atRisk: true,
      riskReason: 'Progress below 20% and no recent access',
    },
    {
      userId: 106,
      userName: 'กัญญา พากเพียร',
      progress: 60,
      grade: 62,
      lastAccess: '2026-02-21T13:20:00Z',
      atRisk: false,
    },
    {
      userId: 107,
      userName: 'อนุชา มานะ',
      progress: 45,
      grade: 50,
      lastAccess: '2026-02-18T10:10:00Z',
      atRisk: false,
    },
    {
      userId: 108,
      userName: 'รัตนา สู้ทน',
      progress: 78,
      grade: 80,
      lastAccess: '2026-02-23T17:00:00Z',
      atRisk: false,
    },
  ],
};

export function useCourseAnalytics(courseId: number) {
  const demoQuery = useQuery<CourseAnalytics>({
    queryKey: ['courseAnalytics', 'demo', courseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_ANALYTICS;
    },
    enabled: isDemoMode && courseId > 0,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CourseAnalytics>({
    queryKey: ['courseAnalytics', courseId],
    queryFn: () =>
      apiFetch<CourseAnalytics>(`/api/moodle/courses/${courseId}/analytics`),
    enabled: !isDemoMode && courseId > 0,
  });

  return isDemoMode ? demoQuery : apiQuery;
}
