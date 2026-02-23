'use client';

import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { PlanDetailView } from '@/components/learning-plans/PlanDetailView';
import { ArrowLeft } from 'lucide-react';

export default function LearningPlanDetailPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push('/learning-plans')}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.back')}
      </button>
      <PlanDetailView planId={id} />
    </div>
  );
}
