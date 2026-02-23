'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useI18n } from '@/contexts/I18nContext';
import { useMyPlans, useApprovePlan, type LearningPlan } from '@/hooks/useLearningPlans';
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react';

export function PlanApprovalQueue() {
  const { t, formatDate } = useI18n();
  const { data: plans, isLoading } = useMyPlans();
  const approveMutation = useApprovePlan();

  const [rejectTarget, setRejectTarget] = useState<LearningPlan | null>(null);

  const pendingPlans = useMemo(
    () => plans?.filter((p) => p.status === 'waiting_for_review') ?? [],
    [plans],
  );

  const handleApprove = (planId: number) => {
    approveMutation.mutate(planId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('planAdmin.approvalQueue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="48px" className="w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <CardTitle>{t('planAdmin.approvalQueue')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPlans.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              {t('planAdmin.noPlansToReview')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-2 font-medium">{t('planAdmin.planName')}</th>
                    <th className="pb-2 font-medium">{t('planAdmin.user')}</th>
                    <th className="pb-2 font-medium">{t('common.status')}</th>
                    <th className="pb-2 font-medium">{t('planAdmin.submittedDate')}</th>
                    <th className="pb-2 font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-gray-900">{plan.name}</td>
                      <td className="py-3 text-gray-600">User #{plan.userId}</td>
                      <td className="py-3">
                        <StatusBadge status="pending" label={t('learningPlans.waitingForReview')} />
                      </td>
                      <td className="py-3 text-gray-600">
                        {formatDate(new Date(plan.createdAt))}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(plan.id)}
                            disabled={approveMutation.isPending}
                            aria-label={t('planAdmin.approve')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" aria-hidden="true" />
                            {t('planAdmin.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejectTarget(plan)}
                            aria-label={t('planAdmin.reject')}
                          >
                            <XCircle className="h-4 w-4 text-red-600 mr-1" aria-hidden="true" />
                            {t('planAdmin.reject')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => setRejectTarget(null)}
        title={t('planAdmin.rejectTitle')}
        message={t('planAdmin.rejectMessage')}
        confirmLabel={t('planAdmin.reject')}
        variant="danger"
      />
    </>
  );
}
