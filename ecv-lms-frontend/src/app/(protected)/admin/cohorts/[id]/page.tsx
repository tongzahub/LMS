'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';
import { CohortManager } from '@/components/users/CohortManager';

interface CohortDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CohortDetailPage({ params }: CohortDetailPageProps) {
  const { id } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const cohortId = parseInt(id, 10);

  const handleSelectCohort = (newId: number) => {
    if (newId === 0) {
      router.push('/admin/cohorts');
    } else {
      router.push(`/admin/cohorts/${newId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-gray-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">{t('cohorts.title')}</h1>
      </div>

      <CohortManager
        selectedCohortId={cohortId}
        onSelectCohort={handleSelectCohort}
      />
    </div>
  );
}
