'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Calendar,
  BookOpen,
  Award,
  GraduationCap,
  Clock,
  Shield,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge, type BadgeStatus } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/contexts/I18nContext';
import { useUsers, type UserListItem } from '@/hooks/useUsers';

function statusToBadge(status: string): BadgeStatus {
  if (status === 'suspended') return 'warning';
  if (status === 'archived') return 'inactive';
  return 'active';
}

export function UserDetailCard() {
  const params = useParams<{ id: string }>();
  const { t, formatDate } = useI18n();
  const { data: users, isLoading, error } = useUsers();

  const user = users?.find((u) => String(u.id) === params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="200px" />
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600" role="alert">
        {t('common.error')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('common.noResults')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.back')}
      </Link>

      {/* Profile header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar placeholder */}
          <div
            className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0"
            aria-hidden="true"
          >
            {user.firstname[0]}
            {user.lastname[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {user.firstname} {user.lastname}
              </h1>
              <StatusBadge
                status={statusToBadge(user.status)}
                label={t(`users.${user.status}`)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t(`users.${user.role.toLowerCase()}`)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {t('users.lastLogin')}:{' '}
                  {user.lastLogin ? formatDate(new Date(user.lastLogin)) : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Joined: {formatDate(new Date(user.createdAt))}</span>
              </div>
            </div>

            {user.cohorts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.cohorts.map((c) => (
                  <span
                    key={c}
                    className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Enrolled courses */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              {t('users.enrolledCoursesCount')} ({user.enrolledCoursesCount})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.enrolledCoursesCount === 0 ? (
            <p className="text-sm text-gray-500">{t('dashboard.noCourses')}</p>
          ) : (
            <p className="text-sm text-gray-500">
              {user.enrolledCoursesCount} course(s) enrolled. Detailed course
              progress will be available when the user profile API is connected.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grades */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              {t('grades.title')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Grade data will be available when the grade overview API is connected.
          </p>
        </CardContent>
      </Card>

      {/* Badges & Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" aria-hidden="true" />
              Badges &amp; Certificates
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Badge and certificate data will be available when the Moodle badges
            API hook is implemented.
          </p>
        </CardContent>
      </Card>

      {/* Learning history */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" aria-hidden="true" />
              Learning History
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Learning history will be available when the activity log API is
            connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
