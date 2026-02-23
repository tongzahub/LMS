'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCourseDetail, useCourseContents } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { CourseOutline } from '@/components/courses/CourseOutline';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SyllabusPage() {
  const params = useParams();
  const courseId = Number(params.id);
  const { t } = useI18n();

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
  const { data: sections = [], isLoading: sectionsLoading } = useCourseContents(courseId);

  const isEnrolled = sections.length > 0 && !sectionsLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/courses" className="hover:text-blue-600 transition-colors">
          {t('courses.catalog')}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${courseId}`} className="hover:text-blue-600 transition-colors">
          {courseLoading ? '...' : course?.fullname ?? t('courses.detail')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t('courses.syllabus')}</span>
      </nav>

      {/* Title */}
      {courseLoading ? (
        <Skeleton variant="text" width="50%" height="32px" />
      ) : (
        <h1 className="text-2xl font-bold text-gray-900">
          {course?.fullname} — {t('courses.syllabus')}
        </h1>
      )}

      {/* Description */}
      {course?.summary && (
        <div
          className="text-sm text-gray-600 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: course.summary }}
        />
      )}

      {/* Full outline */}
      <CourseOutline
        sections={sections}
        isEnrolled={isEnrolled}
        isLoading={sectionsLoading}
      />

      {/* Back link */}
      <div>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm">
            {t('common.back')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
