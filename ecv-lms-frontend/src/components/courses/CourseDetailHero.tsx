'use client';

import Image from 'next/image';
import {
  Clock,
  BarChart3,
  Globe,
  Award,
  Users,
  AlertCircle,
} from 'lucide-react';
import type { CourseDetail } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { useRole } from '@/hooks/useRole';
import { useEnrollSelf } from '@/hooks/useEnrollments';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

interface CourseDetailHeroProps {
  course: CourseDetail;
  isLoading?: boolean;
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}

export function CourseDetailHeroSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Skeleton variant="rectangular" height="200px" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" width="60%" height="28px" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  );
}

export function CourseDetailHero({ course, isLoading }: CourseDetailHeroProps) {
  const { t } = useI18n();
  const { isStudent } = useRole();
  const enrollMutation = useEnrollSelf(course.id);

  if (isLoading) {
    return <CourseDetailHeroSkeleton />;
  }

  const difficultyMap: Record<string, 'active' | 'warning' | 'error' | 'pending'> = {
    beginner: 'active',
    intermediate: 'pending',
    advanced: 'warning',
    expert: 'error',
  };

  const handleEnroll = () => {
    enrollMutation.mutate({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Course image */}
      <div className="relative h-48 sm:h-56 bg-gray-100">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.fullname}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 100vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-blue-50">
            <span className="text-5xl text-blue-300" aria-hidden="true">📚</span>
          </div>
        )}
      </div>

      {/* Course info */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.fullname}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {t('courses.instructor')}: {course.instructorName}
        </p>

        {/* Description */}
        {course.summary && (
          <div
            className="text-sm text-gray-600 mb-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: course.summary }}
          />
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {course.duration && (
            <MetaItem icon={Clock} label={t('courses.duration')} value={course.duration} />
          )}
          {course.difficulty && (
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-gray-500">{t('courses.difficulty')}:</span>
              <StatusBadge
                status={difficultyMap[course.difficulty] ?? 'pending'}
                label={t(`courses.${course.difficulty}`)}
              />
            </div>
          )}
          {course.language && (
            <MetaItem icon={Globe} label={t('courses.language')} value={course.language} />
          )}
          {course.credits != null && (
            <MetaItem icon={Award} label={t('courses.credits')} value={String(course.credits)} />
          )}
          <MetaItem icon={Users} label={t('courses.students')} value={String(course.enrolledCount)} />
        </div>

        {/* Prerequisites */}
        {course.prerequisites.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">{t('courses.prerequisites')}:</p>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((prereq) => (
                <span
                  key={prereq.id}
                  className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  {prereq.fullname}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Enroll CTA */}
        {isStudent && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleEnroll}
              isLoading={enrollMutation.isPending}
              disabled={enrollMutation.isSuccess}
              size="lg"
            >
              {enrollMutation.isSuccess ? t('courses.enrolled') : t('courses.enroll')}
            </Button>
            {enrollMutation.isError && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {enrollMutation.error.message}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
