'use client';

import { useI18n } from '@/contexts/I18nContext';

interface PlanTimelineProps {
  startDate: string;
  dueDate?: string;
  completedAt?: string;
  progress: number;
}

export function PlanTimeline({ startDate, dueDate, completedAt, progress }: PlanTimelineProps) {
  const { t, formatDate } = useI18n();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="space-y-2">
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${completedAt ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {t('planViews.start')}: {formatDate(new Date(startDate))}
        </span>
        {completedAt ? (
          <span className="text-green-600">
            {t('planViews.completed')}: {formatDate(new Date(completedAt))}
          </span>
        ) : dueDate ? (
          <span>
            {t('planViews.due')}: {formatDate(new Date(dueDate))}
          </span>
        ) : null}
      </div>
    </div>
  );
}
