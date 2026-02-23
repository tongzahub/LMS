'use client';

import React from 'react';
import { PlanApprovalQueue } from '@/components/learning-plans/PlanApprovalQueue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';

export default function TeacherPlansPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('planAdmin.planManagement')}</h1>

      <PlanApprovalQueue />

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('planAdmin.progressMonitoring')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Cohort A', 'Cohort B', 'Template: Onboarding'].map((name) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle>{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: '65%' }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">65%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
