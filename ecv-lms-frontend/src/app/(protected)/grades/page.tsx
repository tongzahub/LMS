'use client';

import { BookOpen, AlertCircle } from 'lucide-react';
import { useGradeOverview, type CourseGrades } from '@/hooks/useGrades';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

function GradeBar({ percentage }: { percentage: number | null }) {
  if (percentage == null) return <span className="text-sm text-gray-400">—</span>;
  const color =
    percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage.toFixed(0)}%</span>
    </div>
  );
}

function CourseGradeCard({ course }: { course: CourseGrades }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
          <CardTitle>{course.courseName}</CardTitle>
        </div>
        {course.courseTotal != null && (
          <p className="text-sm text-gray-500 mt-1">
            {t('grades.courseTotal')}: {course.courseTotal.toFixed(1)}%
          </p>
        )}
      </CardHeader>
      <CardContent>
        {course.items.length === 0 ? (
          <p className="text-sm text-gray-400">{t('grades.noGrades')}</p>
        ) : (
          <div className="space-y-3">
            {course.items.map((item) => (
              <div key={item.itemId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.itemName}</span>
                  <span className="text-gray-500">
                    {item.grade != null ? `${item.grade}/${item.gradeMax}` : '—'}
                  </span>
                </div>
                <GradeBar percentage={item.percentage} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton variant="text" width="40%" height="24px" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function GradesPage() {
  const { t } = useI18n();
  const { data: courses, isLoading, isError, error } = useGradeOverview();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('grades.title')}</h1>

      {isLoading && <GradesSkeleton />}

      {isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {error?.message ?? t('common.error')}
        </div>
      )}

      {courses && courses.length === 0 && (
        <p className="text-gray-500 text-sm">{t('grades.noCourses')}</p>
      )}

      {courses && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseGradeCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
