'use client';

import { useCourses } from '@/hooks/useCourses';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { useMyPlans } from '@/hooks/useLearningPlans';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CourseCard } from './CourseCard';
import { ProgressBar } from './ProgressBar';
import { NotificationBell } from './NotificationBell';
import { Calendar, BookOpen, Target } from 'lucide-react';

export function StudentDashboard() {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: events, isLoading: eventsLoading } = useCalendarEvents();
  const { data: plans, isLoading: plansLoading } = useMyPlans();

  const upcomingDeadlines = events
    ?.filter((e) => new Date(e.timeStart) >= new Date())
    .sort((a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime())
    .slice(0, 5);

  const activePlans = plans?.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.givenName ?? '' })}
        </h1>
        <NotificationBell />
      </div>

      {/* Course Cards Grid */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {t('dashboard.enrolledCourses')}
        </h2>
        {coursesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height="200px" />
            ))}
          </div>
        ) : !courses?.length ? (
          <Card><CardContent><p className="text-sm text-gray-400">{t('dashboard.noCourses')}</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                fullname={course.fullname}
                imageUrl={course.imageUrl}
                progress={0}
                lastAccessed={course.startDate}
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
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('dashboard.upcomingDeadlines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height="40px" />
                  ))}
                </div>
              ) : !upcomingDeadlines?.length ? (
                <p className="text-sm text-gray-400">{t('dashboard.noDeadlines')}</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingDeadlines.map((event) => (
                    <li key={event.id} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{event.name}</p>
                        {event.courseName && (
                          <p className="text-xs text-gray-500 truncate">{event.courseName}</p>
                        )}
                      </div>
                      <time className="text-xs text-gray-400 shrink-0">
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
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t('dashboard.activePlans')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height="40px" />
                  ))}
                </div>
              ) : !activePlans?.length ? (
                <p className="text-sm text-gray-400">{t('common.noResults')}</p>
              ) : (
                <ul className="space-y-4">
                  {activePlans.map((plan) => (
                    <li key={plan.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{plan.name}</p>
                        {plan.dueDate && (
                          <time className="text-xs text-gray-400 shrink-0 ml-2">
                            {formatDate(new Date(plan.dueDate))}
                          </time>
                        )}
                      </div>
                      <ProgressBar value={plan.overallProgress} size="sm" />
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
