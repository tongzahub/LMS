'use client';

import { useI18n } from '@/contexts/I18nContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import type { StudentProgress } from '@/hooks/useCourseAnalytics';

interface StudentProgressTableProps {
  students: StudentProgress[];
}

export function StudentProgressTable({ students }: StudentProgressTableProps) {
  const { t, formatDate } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-3 px-4 font-medium">{t('analytics.name')}</th>
            <th className="py-3 px-4 font-medium">{t('analytics.progress')}</th>
            <th className="py-3 px-4 font-medium">{t('analytics.grade')}</th>
            <th className="py-3 px-4 font-medium">{t('analytics.lastAccess')}</th>
            <th className="py-3 px-4 font-medium">{t('common.status')}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.userId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900">{student.userName}</td>
              <td className="py-3 px-4 w-40">
                <ProgressBar value={student.progress} size="sm" />
              </td>
              <td className="py-3 px-4 text-gray-600">
                {student.grade !== null ? `${student.grade}%` : '—'}
              </td>
              <td className="py-3 px-4 text-gray-500">
                {student.lastAccess
                  ? formatDate(new Date(student.lastAccess))
                  : t('analytics.never')}
              </td>
              <td className="py-3 px-4">
                {student.atRisk ? (
                  <StatusBadge
                    status="error"
                    label={student.riskReason ?? t('analytics.atRisk')}
                  />
                ) : (
                  <StatusBadge status="active" label={t('users.active')} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
