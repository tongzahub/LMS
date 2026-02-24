'use client';

import { useParams } from 'next/navigation';
import { useCourseDetail, useCourseContents } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { CourseDetailHero, CourseDetailHeroSkeleton } from '@/components/courses/CourseDetailHero';
import { CourseOutline } from '@/components/courses/CourseOutline';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={AlertCircle}
          title={t('common.error')}
          description="Failed to load course details"
          actionLabel={t('common.retry')}
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: t('courses.catalog'), href: '/courses' },
          { label: course?.fullname ?? t('courses.detail') },
        ]}
      />

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
