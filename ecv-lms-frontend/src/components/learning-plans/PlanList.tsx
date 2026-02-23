'use client';

import { useRouter } from 'next/navigation';
import { useMyPlans } from '@/hooks/useLearningPlans';
import type { LearningPlan } from '@/hooks/useLearningPlans';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge, type BadgeStatus } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { BookOpen, Calendar } from 'lucide-react';

const statusMap: Record<LearningPlan['status'], BadgeStatus> = {
  draft: 'draft',
  waiting_for_review: 'warning',
  in_review: 'warning',
  active: 'active',
  complete: 'success',
};

export function PlanList() {
  const { t, formatDate } = useI18n();
  const { data: plans, isLoading } = useMyPlans();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('planViews.myPlans')}</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="8rem" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('planViews.myPlans')}</h1>

      {!plans?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <BookOpen className="h-10 w-10 mb-2" aria-hidden="true" />
            <p>{t('planViews.noPlans')}</p>
          </CardContent>
        </Card>
      ) : (
        plans.map((plan) => (
          <Card
            key={plan.id}
            className="cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => router.push(`/learning-plans/${plan.id}`)}
          >
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-gray-900">{plan.name}</h2>
                </div>
                <StatusBadge status={statusMap[plan.status]} label={plan.status.replace(/_/g, ' ')} />
              </div>

              {plan.dueDate && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>{formatDate(new Date(plan.dueDate))}</span>
                </div>
              )}

              <ProgressBar value={plan.overallProgress} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
