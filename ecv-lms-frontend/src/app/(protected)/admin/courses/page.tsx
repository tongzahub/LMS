'use client';

import { useRouter } from 'next/navigation';
import { useCourses, useUpdateCourse } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Eye, EyeOff } from 'lucide-react';
import type { Course } from '@/hooks/useCourses';

type CourseRow = Course & Record<string, unknown>;

export default function AdminCoursesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();
  const updateCourse = useUpdateCourse();

  const toggleVisibility = (course: CourseRow) => {
    updateCourse.mutate({ id: course.id, visible: !course.visible });
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
        <div className="flex items-center gap-2">
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
        <Button onClick={() => router.push('/admin/courses/create')}>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('courseManagement.createCourse')}
        </Button>
      </div>
      <DataTable<CourseRow>
        columns={columns}
        data={(courses ?? []) as CourseRow[]}
        getRowKey={(item) => item.id}
        searchable
        searchPlaceholder={t('courses.searchPlaceholder')}
        emptyMessage={t('courses.noCourses')}
      />
    </div>
  );
}
