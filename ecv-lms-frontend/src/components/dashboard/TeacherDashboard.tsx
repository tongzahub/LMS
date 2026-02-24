'use client';

import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

import {
  BookOpen,
  Users,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  Inbox,
  Plus,
  CheckSquare,
  Megaphone,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeacherCourseOverview {
  courseId: number;
  courseName: string;
  category: string;
  studentCount: number;
  completionRate: number;
  pendingSubmissions: number;
  color: string;
}

interface AtRiskStudent {
  userId: number;
  userName: string;
  initials: string;
  courseId: number;
  courseName: string;
  reason: 'low_progress' | 'overdue_assignments' | 'no_recent_login';
  progress: number;
  lastLogin?: string;
}

interface Submission {
  id: number;
  studentName: string;
  initials: string;
  courseName: string;
  activityName: string;
  submittedAt: string;
  status: 'submitted' | 'late' | 'resubmitted';
}

interface ScheduleSession {
  id: number;
  courseName: string;
  topic: string;
  date: string;
  time: string;
  room: string;
  studentCount: number;
}

// ---------------------------------------------------------------------------
// Risk reason config
// ---------------------------------------------------------------------------

const RISK_REASON_MAP: Record<AtRiskStudent['reason'], { label: string; status: 'warning' | 'error' }> = {
  low_progress: { label: 'Low Progress', status: 'warning' },
  overdue_assignments: { label: 'Overdue', status: 'error' },
  no_recent_login: { label: 'Inactive', status: 'warning' },
};

// ---------------------------------------------------------------------------
// Static placeholder data — will be replaced by real API hooks
// ---------------------------------------------------------------------------

const STATIC_AT_RISK: AtRiskStudent[] = [
  { userId: 101, userName: 'Somchai Ratchanon', initials: 'SR', courseId: 1, courseName: 'Web Dev Bootcamp', reason: 'low_progress', progress: 12, lastLogin: '2026-02-10' },
  { userId: 102, userName: 'Nantawan Kaewsri', initials: 'NK', courseId: 2, courseName: 'Data Science 101', reason: 'overdue_assignments', progress: 34, lastLogin: '2026-02-15' },
  { userId: 103, userName: 'Prasong Wattana', initials: 'PW', courseId: 1, courseName: 'Web Dev Bootcamp', reason: 'no_recent_login', progress: 45, lastLogin: '2026-01-28' },
  { userId: 104, userName: 'Kanjana Sutthichai', initials: 'KS', courseId: 3, courseName: 'Business English', reason: 'overdue_assignments', progress: 20, lastLogin: '2026-02-18' },
  { userId: 105, userName: 'Wichit Boonsri', initials: 'WB', courseId: 2, courseName: 'Data Science 101', reason: 'low_progress', progress: 8, lastLogin: '2026-02-20' },
  { userId: 106, userName: 'Siriporn Mahachon', initials: 'SM', courseId: 4, courseName: 'Project Mgmt Pro', reason: 'no_recent_login', progress: 51, lastLogin: '2026-01-20' },
];

const STATIC_SUBMISSIONS: Submission[] = [
  { id: 1, studentName: 'Anong Thongchai', initials: 'AT', courseName: 'Web Dev Bootcamp', activityName: 'Assignment 3: CSS Layouts', submittedAt: '2026-02-24T09:30:00', status: 'submitted' },
  { id: 2, studentName: 'Bamrung Pichit', initials: 'BP', courseName: 'Data Science 101', activityName: 'Quiz 5: Pandas DataFrames', submittedAt: '2026-02-24T08:15:00', status: 'late' },
  { id: 3, studentName: 'Chantra Srisuk', initials: 'CS', courseName: 'Business English', activityName: 'Week 4 Writing Exercise', submittedAt: '2026-02-23T16:45:00', status: 'submitted' },
  { id: 4, studentName: 'Decha Rattana', initials: 'DR', courseName: 'Web Dev Bootcamp', activityName: 'Assignment 3: CSS Layouts', submittedAt: '2026-02-23T14:00:00', status: 'resubmitted' },
  { id: 5, studentName: 'Ekachai Noppadon', initials: 'EN', courseName: 'Project Mgmt Pro', activityName: 'Case Study 2', submittedAt: '2026-02-23T11:30:00', status: 'submitted' },
  { id: 6, studentName: 'Fon Chaiyapruk', initials: 'FC', courseName: 'Data Science 101', activityName: 'Lab 6: Matplotlib', submittedAt: '2026-02-22T20:10:00', status: 'late' },
  { id: 7, studentName: 'Ganya Supawan', initials: 'GS', courseName: 'Business English', activityName: 'Presentation Slides', submittedAt: '2026-02-22T17:55:00', status: 'submitted' },
  { id: 8, studentName: 'Hathairat Boonmak', initials: 'HB', courseName: 'Web Dev Bootcamp', activityName: 'Project Milestone 1', submittedAt: '2026-02-22T10:20:00', status: 'submitted' },
];

const SCHEDULE: ScheduleSession[] = [
  { id: 1, courseName: 'Web Dev Bootcamp', topic: 'JavaScript ES2024 Features', date: 'Today', time: '10:00–11:30', room: 'Online', studentCount: 28 },
  { id: 2, courseName: 'Data Science 101', topic: 'Introduction to Machine Learning', date: 'Today', time: '14:00–15:30', room: 'Room B-201', studentCount: 24 },
  { id: 3, courseName: 'Business English', topic: 'Presentations & Public Speaking', date: 'Tomorrow', time: '09:00–10:30', room: 'Online', studentCount: 18 },
  { id: 4, courseName: 'Project Mgmt Pro', topic: 'Agile Sprint Planning Workshop', date: 'Wed Feb 26', time: '13:00–16:00', room: 'Room A-104', studentCount: 32 },
  { id: 5, courseName: 'Web Dev Bootcamp', topic: 'React Hooks Deep Dive', date: 'Thu Feb 27', time: '10:00–11:30', room: 'Online', studentCount: 28 },
];

const COURSE_COLORS = [
  { bar: 'from-brand-400 to-brand-600', badge: 'bg-brand-100 text-brand-700' },
  { bar: 'from-purple-400 to-purple-600', badge: 'bg-purple-100 text-purple-700' },
  { bar: 'from-green-400 to-green-600', badge: 'bg-green-100 text-green-700' },
  { bar: 'from-amber-400 to-amber-600', badge: 'bg-amber-100 text-amber-700' },
  { bar: 'from-pink-400 to-pink-600', badge: 'bg-pink-100 text-pink-700' },
  { bar: 'from-teal-400 to-teal-600', badge: 'bg-teal-100 text-teal-700' },
];

const SUBMISSION_STATUS_STYLES: Record<Submission['status'], { badge: string; label: string }> = {
  submitted: { badge: 'bg-green-100 text-green-700', label: 'Submitted' },
  late: { badge: 'bg-red-100 text-red-700', label: 'Late' },
  resubmitted: { badge: 'bg-amber-100 text-amber-700', label: 'Resubmitted' },
};

// ---------------------------------------------------------------------------
// Hook: derive managed course overviews
// ---------------------------------------------------------------------------

function usePlaceholderTeacherData(courses: ReturnType<typeof useCourses>['data']) {
  const managedCourses: TeacherCourseOverview[] = (courses ?? []).map((c, idx) => ({
    courseId: c.id,
    courseName: c.fullname,
    category: c.categoryName,
    studentCount: c.enrolledCount,
    completionRate: [68, 82, 45, 91, 57, 73][idx % 6] ?? Math.round(50 + idx * 7),
    pendingSubmissions: [4, 7, 2, 0, 9, 3][idx % 6] ?? Math.floor(idx * 1.5),
    color: COURSE_COLORS[idx % COURSE_COLORS.length].bar,
  }));

  return { managedCourses, atRiskStudents: STATIC_AT_RISK, recentSubmissions: STATIC_SUBMISSIONS };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeacherDashboard() {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const { data: courses, isLoading } = useCourses();
  const { managedCourses, atRiskStudents, recentSubmissions } = usePlaceholderTeacherData(courses);

  const totalStudents = managedCourses.reduce((sum, c) => sum + c.studentCount, 0);
  const avgCompletion =
    managedCourses.length > 0
      ? Math.round(managedCourses.reduce((sum, c) => sum + c.completionRate, 0) / managedCourses.length)
      : 0;
  const totalPending = managedCourses.reduce((sum, c) => sum + c.pendingSubmissions, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('dashboard.welcome', { name: user?.givenName ?? '' })}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your courses and track student progress</p>
        </div>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary">
            <Plus className="w-3.5 h-3.5" />
            Create Assignment
          </Button>
          <Button size="sm" variant="outline">
            <CheckSquare className="w-3.5 h-3.5" />
            Grade Submissions
          </Button>
          <Button size="sm" variant="outline">
            <Megaphone className="w-3.5 h-3.5" />
            Announcement
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: t('courses.students'),
            value: totalStudents,
            icon: Users,
            iconBg: 'bg-brand-600',
            bg: 'from-brand-50 to-brand-100/60',
            sub: `Across ${managedCourses.length} courses`,
          },
          {
            label: t('courses.completionRate'),
            value: `${avgCompletion}%`,
            icon: TrendingUp,
            iconBg: 'bg-green-600',
            bg: 'from-green-50 to-emerald-100/60',
            sub: 'Average across all courses',
          },
          {
            label: 'Pending Submissions',
            value: totalPending,
            icon: ClipboardCheck,
            iconBg: 'bg-amber-600',
            bg: 'from-amber-50 to-orange-100/60',
            sub: 'Awaiting your review',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br ${stat.bg} p-4 shadow-sm`}
          >
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shadow-sm`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{stat.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5 pr-10">{stat.label}</p>
            <p className="text-[11px] text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Managed Courses */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          {t('dashboard.managedCourses')}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton variant="rectangular" height="160px" />
              </div>
            ))}
          </div>
        ) : !managedCourses.length ? (
          <EmptyState icon={BookOpen} title={t('dashboard.noCourses')} description="No courses assigned yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedCourses.map((course, idx) => {
              const colorSet = COURSE_COLORS[idx % COURSE_COLORS.length];
              const completionColor =
                course.completionRate >= 80
                  ? 'text-green-600 bg-green-50'
                  : course.completionRate >= 50
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-red-600 bg-red-50';
              return (
                <Card key={course.courseId} hoverable className="flex flex-col">
                  {/* Color bar top */}
                  <div className={`h-1.5 rounded-t-xl bg-gradient-to-r ${colorSet.bar} -mx-4 -mt-4 mb-3`} />
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
                        {course.courseName}
                      </h3>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorSet.badge}`}>
                        {course.category}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {t('courses.students')}
                        </span>
                        <span className="font-semibold text-gray-900">{course.studentCount}</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-gray-500">Completion</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completionColor}`}>
                            {course.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 bg-gradient-to-r ${colorSet.bar} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Pending
                        </span>
                        {course.pendingSubmissions > 0 ? (
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                            {course.pendingSubmissions} to grade
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-semibold">All clear</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Teaching Schedule + At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teaching Schedule */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-brand-500" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {SCHEDULE.map((session) => (
                  <li key={session.id} className="flex items-start gap-3 group">
                    <div className="shrink-0 mt-0.5 w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-semibold text-brand-500 uppercase leading-none">{session.date.slice(0, 3)}</span>
                      <Clock className="w-3 h-3 text-brand-400 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                        {session.topic}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{session.courseName}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                        <span>{session.date} · {session.time}</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{session.room}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-medium text-gray-500">{session.studentCount}</span>
                      <p className="text-[10px] text-gray-400">students</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* At-Risk Students */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                {t('dashboard.atRiskStudents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!atRiskStudents.length ? (
                <EmptyState icon={Users} title={t('common.noResults')} description="No at-risk students detected" />
              ) : (
                <ul className="space-y-3">
                  {atRiskStudents.map((student) => {
                    const risk = RISK_REASON_MAP[student.reason];
                    return (
                      <li key={`${student.userId}-${student.courseId}`} className="flex items-center gap-3 text-sm group">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-600">{student.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{student.userName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-1 rounded-full ${student.progress < 30 ? 'bg-red-400' : 'bg-amber-400'}`}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 tabular-nums">{student.progress}%</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={risk.status} label={risk.label} />
                          <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{student.courseName}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-brand-500" />
              {t('dashboard.recentSubmissions')}
            </CardTitle>
            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5 transition-colors">
              Grade all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {!recentSubmissions.length ? (
            <EmptyState icon={Inbox} title={t('common.noResults')} description="No recent submissions" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentSubmissions.map((sub) => {
                const style = SUBMISSION_STATUS_STYLES[sub.status];
                return (
                  <li key={sub.id} className="flex items-center gap-3 text-sm py-2.5 group">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-brand-700">{sub.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{sub.studentName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {sub.activityName} · <span className="text-gray-400">{sub.courseName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                      <time className="text-xs text-gray-400 tabular-nums hidden sm:block">
                        {formatDate(new Date(sub.submittedAt))}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
