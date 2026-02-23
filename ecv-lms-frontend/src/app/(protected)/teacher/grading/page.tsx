'use client';

import React from 'react';
import Link from 'next/link';
import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PenLine, BookOpen } from 'lucide-react';

export default function TeacherGradingPage() {
  const { t } = useI18n();
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="200px" height="32px" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="80px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PenLine className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {t('nav.grading')}
        </h1>
      </div>

      {(!courses || courses.length === 0) ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block hover:ring-2 hover:ring-blue-200 rounded-lg transition-shadow"
            >
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {course.fullname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {course.enrolledCount} students enrolled
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 hover:text-blue-800">
                      Grade submissions →
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
