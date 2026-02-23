'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookMarked, BarChart3 } from 'lucide-react';
import type { Course } from '@/hooks/useCourses';

type CourseRow = Course & Record<string, unknown>;

export default function TeacherCoursesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: courses, isLoading } = useCourses();

  const columns: DataTableColumn<CourseRow>[] = [
    {
      key: 'fullname',
      header: t('courses.name'),
      render: (course) => (
        <span className="font-medium text-gray-900">{course.fullname}</span>
      ),
    },
    {
      key: 'enrolledCount',
      header: 'Students',
      render: (course) => (
        <span className="text-gray-600">{course.enrolledCount}</span>
      ),
    },
    {
      key: 'visible',
      header: 'Status',
      render: (course) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            course.visible
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {course.visible ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (course) => (
        <button
          onClick={() => router.push(`/courses/${course.id}/analytics`)}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          aria-label={`View analytics for ${course.fullname}`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="48px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookMarked className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {t('nav.managedCourses')}
        </h1>
      </div>

      <DataTable<CourseRow>
        columns={columns}
        data={(courses as CourseRow[]) ?? []}
        getRowKey={(course) => course.id}
        searchable
        searchPlaceholder={t('courses.searchPlaceholder')}
        emptyMessage="No courses found"
      />
    </div>
  );
}
