'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCourses } from '@/hooks/useCourses';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { useMyPlans } from '@/hooks/useLearningPlans';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CourseCard } from './CourseCard';
import { ProgressBar } from './ProgressBar';
import { NotificationBell } from './NotificationBell';
import {
  Calendar,
  BookOpen,
  Target,
  Play,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Inbox,
  TrendingUp,
  BarChart3,
  FileText,
  Star,
  Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Recent Activity placeholder — will come from an activity log API
// ---------------------------------------------------------------------------

const RECENT_ACTIVITY_ITEMS = [
  { id: 1, action: 'Completed Quiz 3 in Web Development', time: '2 hours ago', icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50', score: '92/100' },
  { id: 2, action: 'Submitted Assignment: CSS Layout Design', time: 'Yesterday', icon: FileText, iconColor: 'text-brand-500', iconBg: 'bg-brand-50', score: null },
  { id: 3, action: 'Earned badge: "Fast Learner"', time: '2 days ago', icon: Star, iconColor: 'text-amber-500', iconBg: 'bg-amber-50', score: null },
  { id: 4, action: 'Watched lecture: JavaScript Promises', time: '3 days ago', icon: Play, iconColor: 'text-purple-500', iconBg: 'bg-purple-50', score: null },
  { id: 5, action: 'Started new course: Data Science 101', time: '4 days ago', icon: Zap, iconColor: 'text-teal-500', iconBg: 'bg-teal-50', score: null },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StudentDashboard() {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: events, isLoading: eventsLoading } = useCalendarEvents();
  const { data: plans, isLoading: plansLoading } = useMyPlans();
  const [courseTab, setCourseTab] = useState<'all' | 'inProgress' | 'completed'>('all');

  const upcomingDeadlines = events
    ?.filter((e) => new Date(e.timeStart) >= new Date())
    .sort((a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime())
    .slice(0, 5);

  const activePlans = plans?.filter((p) => p.status === 'active');

  const lastCourse = courses?.[0];

  // Quick stats
  const totalCourses = courses?.length ?? 0;
  const completedCourses = courses?.filter((c) => !c.visible).length ?? 0; // placeholder logic
  const inProgressCourses = Math.max(0, totalCourses - completedCourses);
  const avgGrade = 78; // placeholder until grade hook integrated
  const activePlanCount = activePlans?.length ?? 0;

  // Overall learning plan progress (average across active plans)
  const overallPlanProgress =
    activePlans && activePlans.length > 0
      ? Math.round(activePlans.reduce((sum, p) => sum + p.overallProgress, 0) / activePlans.length)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('dashboard.welcome', { name: user?.givenName ?? '' })}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with your learning</p>
        </div>
        <NotificationBell />
      </div>

      {/* Quick Stats Row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Courses',
            value: totalCourses,
            icon: BookOpen,
            iconBg: 'bg-brand-600',
            bg: 'from-brand-50 to-brand-100/60',
            sub: 'Enrolled',
          },
          {
            label: 'Completed',
            value: completedCourses,
            icon: CheckCircle,
            iconBg: 'bg-green-600',
            bg: 'from-green-50 to-emerald-100/60',
            sub: 'Courses done',
          },
          {
            label: 'In Progress',
            value: inProgressCourses,
            icon: TrendingUp,
            iconBg: 'bg-purple-600',
            bg: 'from-purple-50 to-violet-100/60',
            sub: 'Keep going',
          },
          {
            label: 'Avg. Grade',
            value: `${avgGrade}%`,
            icon: BarChart3,
            iconBg: 'bg-amber-600',
            bg: 'from-amber-50 to-orange-100/60',
            sub: 'Across all courses',
          },
        ].map(({ label, value, icon: Icon, iconBg, bg, sub }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br ${bg} p-4 shadow-sm`}
          >
            <div className={`absolute top-3 right-3 w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{value}</p>
            <p className="text-xs font-medium text-gray-700 pr-8">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </section>

      {/* Continue Learning Hero */}
      {!coursesLoading && lastCourse && (
        <section>
          <Card padding="none" className="overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 border-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-56 h-36 sm:h-auto shrink-0">
                {lastCourse.imageUrl ? (
                  <Image src={lastCourse.imageUrl} alt="" fill className="object-cover" sizes="224px" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-brand-800/30">
                    <BookOpen className="w-10 h-10 text-white/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-700/50 hidden sm:block" />
              </div>
              <div className="p-5 sm:p-6 flex flex-col justify-center text-white flex-1">
                <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">Continue Learning</p>
                <h2 className="text-lg font-bold mb-1 line-clamp-1">{lastCourse.fullname}</h2>
                <p className="text-brand-200 text-sm mb-3 line-clamp-1">{lastCourse.instructorName}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: '35%' }} />
                  </div>
                  <span className="text-xs text-brand-100 tabular-nums font-medium">35%</span>
                </div>
                <Link href={`/courses/${lastCourse.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/95 text-brand-700 hover:bg-white shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" fill="currentColor" />
                    Resume Course
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Course Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            {t('dashboard.enrolledCourses')}
          </h2>
          {/* Tab filters */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['all', 'inProgress', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCourseTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  courseTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'inProgress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {coursesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton variant="rectangular" height="160px" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </div>
            ))}
          </div>
        ) : !courses?.length ? (
          <EmptyState
            icon={BookOpen}
            title={t('dashboard.noCourses')}
            description="Browse our course catalog to find something interesting"
            actionLabel="Browse Courses"
            onAction={() => { window.location.href = '/courses'; }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course, idx) => (
              <CourseCard
                key={course.id}
                id={course.id}
                fullname={course.fullname}
                imageUrl={course.imageUrl}
                progress={[35, 68, 12, 91, 45, 0][idx % 6] ?? 0}
                lastAccessed={course.startDate}
                category={course.categoryName}
                instructorName={course.instructorName}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-brand-500" />
                {t('dashboard.upcomingDeadlines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton variant="circular" width="32px" height="32px" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !upcomingDeadlines?.length ? (
                <EmptyState
                  icon={Calendar}
                  title={t('dashboard.noDeadlines')}
                  description="No upcoming deadlines. You're all caught up!"
                />
              ) : (
                <ul className="space-y-3">
                  {upcomingDeadlines.map((event) => (
                    <li key={event.id} className="flex items-start gap-3 text-sm group">
                      <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">{event.name}</p>
                        {event.courseName && (
                          <p className="text-xs text-gray-500 truncate">{event.courseName}</p>
                        )}
                      </div>
                      <time className="text-xs text-gray-400 shrink-0 mt-0.5">
                        {formatDate(new Date(event.timeStart))}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Active Learning Plans */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-4 h-4 text-purple-500" />
                  {t('dashboard.activePlans')}
                </CardTitle>
                {(activePlans?.length ?? 0) > 0 && (
                  <Link href="/learning-plans" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5 transition-colors">
                    View all
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height="6px" />
                    </div>
                  ))}
                </div>
              ) : !activePlans?.length ? (
                <EmptyState
                  icon={Inbox}
                  title={t('common.noResults')}
                  description="No active learning plans yet"
                />
              ) : (
                <>
                  {/* Overall progress indicator */}
                  {activePlanCount > 1 && (
                    <div className="mb-5 p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-700">Overall Learning Progress</span>
                        <span className="text-xs font-bold text-purple-700 tabular-nums">{overallPlanProgress}%</span>
                      </div>
                      <div className="w-full bg-purple-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-700"
                          style={{ width: `${overallPlanProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-purple-500 mt-1.5">{activePlanCount} active plan{activePlanCount > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <ul className="space-y-4">
                    {activePlans.map((plan) => (
                      <li key={plan.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                            {plan.name}
                          </p>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs font-bold text-purple-600 tabular-nums">{plan.overallProgress}%</span>
                            {plan.dueDate && (
                              <time className="text-xs text-gray-400">
                                {formatDate(new Date(plan.dueDate))}
                              </time>
                            )}
                          </div>
                        </div>
                        <ProgressBar value={plan.overallProgress} size="sm" colorScheme="gradient" showLabel={false} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-brand-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {RECENT_ACTIVITY_ITEMS.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm group">
                <div className={`shrink-0 w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{item.action}</p>
                  {item.score && (
                    <p className="text-xs font-semibold text-green-600 mt-0.5">Score: {item.score}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0 tabular-nums">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Certificates section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Certificates earned */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">2</p>
              <p className="text-sm text-gray-600 font-medium">Certificates Earned</p>
              <p className="text-xs text-gray-400 mt-0.5">Web Dev Level 1, English B1</p>
            </div>
          </CardContent>
        </Card>

        {/* Grade summary */}
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{avgGrade}%</p>
              <p className="text-sm text-gray-600 font-medium">Average Grade</p>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                  style={{ width: `${avgGrade}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
