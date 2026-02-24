'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourses, useUpdateCourse } from '@/hooks/useCourses';
import { useMedia } from '@/hooks/useMedia';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { VideoUploader } from '@/components/media/VideoUploader';
import { Plus, Eye, EyeOff, Film, Upload } from 'lucide-react';
import type { Course } from '@/hooks/useCourses';

type CourseRow = Course & Record<string, unknown>;

export default function AdminCoursesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const { data: allMedia } = useMedia();
  const updateCourse = useUpdateCourse();
  const [uploadCourseId, setUploadCourseId] = useState<number | null>(null);

  const toggleVisibility = (course: CourseRow) => {
    updateCourse.mutate({ id: course.id, visible: !course.visible });
  };

  const getVideoCount = (courseId: number): number => {
    return (allMedia ?? []).filter((m) => m.courseId === courseId).length;
  };

  const columns: DataTableColumn<CourseRow>[] = [
    { key: 'fullname', header: t('courseManagement.title') },
    { key: 'shortname', header: t('courseManagement.shortname') },
    { key: 'categoryName', header: t('courseManagement.category') },
    {
      key: 'enrolledCount',
      header: t('courses.students'),
      render: (course) => <span>{course.enrolledCount}</span>,
    },
    {
      key: 'videos',
      header: 'Videos',
      render: (course) => {
        const count = getVideoCount(course.id);
        return (
          <div className="flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-gray-400" />
            <span className={count > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}>{count}</span>
          </div>
        );
      },
    },
    {
      key: 'visible',
      header: t('common.status'),
      render: (course) => (
        <StatusBadge
          status={course.visible ? 'active' : 'draft'}
          label={course.visible ? t('courseManagement.published') : t('courseManagement.draft')}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (course) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleVisibility(course)}
            className="p-1.5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            aria-label={course.visible ? t('courseManagement.hide') : t('courseManagement.show')}
          >
            {course.visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={() => setUploadCourseId(course.id)}
            className="p-1.5 rounded text-gray-500 hover:text-purple-600 hover:bg-purple-50"
            aria-label="Upload video"
            title="Upload video"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/courses/${course.id}`)}
          >
            {t('common.edit')}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('courseManagement.courseList')}
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/admin/videos')}>
            <Film className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Video Library
          </Button>
          <Button onClick={() => router.push('/admin/courses/create')}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('courseManagement.createCourse')}
          </Button>
        </div>
      </div>
      <DataTable<CourseRow>
        columns={columns}
        data={(courses ?? []) as CourseRow[]}
        getRowKey={(item) => item.id}
        searchable
        searchPlaceholder={t('courses.searchPlaceholder')}
        emptyMessage={t('courses.noCourses')}
      />

      {/* Video upload modal for specific course */}
      <Modal
        isOpen={!!uploadCourseId}
        onClose={() => setUploadCourseId(null)}
        title={`Upload Video — ${courses?.find((c) => c.id === uploadCourseId)?.fullname ?? ''}`}
        size="lg"
      >
        {uploadCourseId && (
          <VideoUploader
            courseId={uploadCourseId}
            onUploadComplete={() => setUploadCourseId(null)}
            onCancel={() => setUploadCourseId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
