'use client';

import React from 'react';
import Link from 'next/link';
import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';

export default function TeacherProgressPage() {
  const { t } = useI18n();
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="240px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="160px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {t('nav.studentProgress')}
        </h1>
      </div>

      {(!courses || courses.length === 0) ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}/analytics`}
              className="block hover:ring-2 hover:ring-blue-200 rounded-lg transition-shadow"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{course.fullname}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledCount} students
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      View progress
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
