'use client';

import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from './ProgressBar';
import {
  BookOpen,
  Users,
  AlertTriangle,
  FileText,
  ClipboardCheck,
} from 'lucide-react';

// Placeholder types — will be replaced by real API data from course analytics
interface TeacherCourseOverview {
  courseId: number;
  courseName: string;
  studentCount: number;
  completionRate: number;
  pendingSubmissions: number;
}

interface AtRiskStudent {
  userId: number;
  userName: string;
  courseId: number;
  courseName: string;
  reason: 'low_progress' | 'overdue_assignments' | 'no_recent_login';
  progress: number;
  lastLogin?: string;
}

interface Submission {
  id: number;
  studentName: string;
  courseName: string;
  activityName: string;
  submittedAt: string;
}

const RISK_REASON_MAP: Record<AtRiskStudent['reason'], { label: string; status: 'warning' | 'error' }> = {
  low_progress: { label: 'Low Progress', status: 'warning' },
  overdue_assignments: { label: 'Overdue', status: 'error' },
  no_recent_login: { label: 'Inactive', status: 'warning' },
};

// Placeholder data — will be replaced by useCourseAnalytics / useTeacherDashboard hooks
function usePlaceholderTeacherData(courses: ReturnType<typeof useCourses>['data']) {
  // Derive managed course overviews from course list
  const managedCourses: TeacherCourseOverview[] = (courses ?? []).map((c) => ({
    courseId: c.id,
    courseName: c.fullname,
    studentCount: c.enrolledCount,
    completionRate: Math.round(Math.random() * 100),
    pendingSubmissions: Math.floor(Math.random() * 10),
  }));

  const atRiskStudents: AtRiskStudent[] = [];
  const recentSubmissions: Submission[] = [];

  return { managedCourses, atRiskStudents, recentSubmissions };
}

export function TeacherDashboard() {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const { data: courses, isLoading } = useCourses();
  const { managedCourses, atRiskStudents, recentSubmissions } =
    usePlaceholderTeacherData(courses);

  const totalStudents = managedCourses.reduce((sum, c) => sum + c.studentCount, 0);
  const avgCompletion =
    managedCourses.length > 0
      ? Math.round(managedCourses.reduce((sum, c) => sum + c.completionRate, 0) / managedCourses.length)
      : 0;
  const totalPending = managedCourses.reduce((sum, c) => sum + c.pendingSubmissions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.givenName ?? '' })}
        </h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                <p className="text-sm text-gray-500">{t('courses.students')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgCompletion}%</p>
                <p className="text-sm text-gray-500">{t('courses.completionRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPending}</p>
                <p className="text-sm text-gray-500">{t('dashboard.recentSubmissions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Managed Courses */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {t('dashboard.managedCourses')}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height="160px" />
            ))}
          </div>
        ) : !managedCourses.length ? (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-400">{t('dashboard.noCourses')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedCourses.map((course) => (
              <Card key={course.courseId}>
                <CardContent>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">
                    {course.courseName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t('courses.students')}</span>
                      <span className="font-medium">{course.studentCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('courses.completionRate')}</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <ProgressBar value={course.completionRate} size="sm" showLabel={false} />
                    <div className="flex justify-between">
                      <span>{t('dashboard.recentSubmissions')}</span>
                      <span className="font-medium">{course.pendingSubmissions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Students */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t('dashboard.atRiskStudents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!atRiskStudents.length ? (
                <p className="text-sm text-gray-400">{t('common.noResults')}</p>
              ) : (
                <ul className="space-y-3">
                  {atRiskStudents.map((student) => {
                    const risk = RISK_REASON_MAP[student.reason];
                    return (
                      <li key={`${student.userId}-${student.courseId}`} className="flex items-start gap-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{student.userName}</p>
                          <p className="text-xs text-gray-500 truncate">{student.courseName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-500">{student.progress}%</span>
                          <StatusBadge status={risk.status} label={risk.label} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Submissions */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('dashboard.recentSubmissions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentSubmissions.length ? (
                <p className="text-sm text-gray-400">{t('common.noResults')}</p>
              ) : (
                <ul className="space-y-3">
                  {recentSubmissions.map((sub) => (
                    <li key={sub.id} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{sub.studentName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {sub.activityName} · {sub.courseName}
                        </p>
                      </div>
                      <time className="text-xs text-gray-400 shrink-0">
                        {formatDate(new Date(sub.submittedAt))}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
