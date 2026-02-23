'use client';

import { useParams } from 'next/navigation';
import { useCourseDetail, useCourseContents } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { CourseDetailHero, CourseDetailHeroSkeleton } from '@/components/courses/CourseDetailHero';
import { CourseOutline } from '@/components/courses/CourseOutline';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const { t } = useI18n();

  const { data: course, isLoading: courseLoading, isError: courseError } = useCourseDetail(courseId);
  const { data: sections = [], isLoading: sectionsLoading } = useCourseContents(courseId);

  // Determine enrollment — if course contents load successfully, user is likely enrolled
  const isEnrolled = sections.length > 0 && !sectionsLoading;

  if (courseError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('common.error')}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/courses" className="hover:text-blue-600 transition-colors">
          {t('courses.catalog')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{course?.fullname ?? t('courses.detail')}</span>
      </nav>

      {/* Hero */}
      {courseLoading || !course ? (
        <CourseDetailHeroSkeleton />
      ) : (
        <CourseDetailHero course={course} />
      )}

      {/* Syllabus link */}
      {course && (
        <div className="flex justify-end">
          <Link href={`/courses/${courseId}/syllabus`}>
            <Button variant="outline" size="sm">
              {t('courses.syllabus')}
            </Button>
          </Link>
        </div>
      )}

      {/* Course outline */}
      <CourseOutline
        sections={sections}
        isEnrolled={isEnrolled}
        isLoading={sectionsLoading}
      />
    </div>
  );
}
