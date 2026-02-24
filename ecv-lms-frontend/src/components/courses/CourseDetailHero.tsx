'use client';

import Image from 'next/image';
import {
  Clock,
  Globe,
  Award,
  Users,
  AlertCircle,
  Play,
  BookOpen,
  CheckCircle,
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

export function CourseDetailHeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <Skeleton variant="rectangular" height="280px" />
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
    <div className="rounded-2xl overflow-hidden animate-fade-in">
      {/* Dark gradient hero overlay */}
      <div className="relative">
        <div className="absolute inset-0">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-700 to-indigo-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/60" />
        </div>

        <div className="relative px-6 py-8 sm:py-10 lg:py-12">
          <div className="max-w-2xl">
            {/* Category badge */}
            {course.categoryName && (
              <span className="inline-flex items-center text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full mb-3 backdrop-blur-sm">
                {course.categoryName}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">{course.fullname}</h1>

            {/* Short description */}
            {course.summary && (
              <p className="text-gray-300 text-sm mb-4 line-clamp-2 max-w-xl">
                {course.summary.replace(/<[^>]*>/g, '').substring(0, 200)}
              </p>
            )}

            {/* Instructor */}
            <p className="text-sm text-gray-300 mb-4">
              {t('courses.instructor')}:{' '}
              <span className="text-white font-medium">{course.instructorName}</span>
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {course.enrolledCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {course.enrolledCount.toLocaleString()} students
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              )}
              {course.difficulty && (
                <StatusBadge
                  status={difficultyMap[course.difficulty] ?? 'pending'}
                  label={t(`courses.${course.difficulty}`)}
                />
              )}
              {course.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </span>
              )}
              {course.credits != null && (
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  {course.credits} {t('courses.credits')}
                </span>
              )}
            </div>

            {/* Enroll CTA */}
            {isStudent && (
              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleEnroll}
                  isLoading={enrollMutation.isPending}
                  disabled={enrollMutation.isSuccess}
                  size="lg"
                  className={enrollMutation.isSuccess
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-white text-brand-700 hover:bg-gray-100 shadow-lg'
                  }
                >
                  {enrollMutation.isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('courses.enrolled')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" fill="currentColor" />
                      {t('courses.enroll')}
                    </>
                  )}
                </Button>
                {enrollMutation.isError && (
                  <span className="flex items-center gap-1 text-sm text-red-300">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {enrollMutation.error.message}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course info section below hero */}
      <div className="bg-white border border-gray-200/80 border-t-0 rounded-b-2xl p-6 space-y-6">
        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Prerequisites */}
        {course.prerequisites.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('courses.prerequisites')}</p>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((prereq) => (
                <span
                  key={prereq.id}
                  className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium"
                >
                  <BookOpen className="w-3 h-3 mr-1.5 text-gray-400" />
                  {prereq.fullname}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full description */}
        {course.summary && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">About this course</p>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: course.summary }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
