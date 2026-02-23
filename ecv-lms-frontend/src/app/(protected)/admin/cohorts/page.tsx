'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';
import { CohortManager } from '@/components/users/CohortManager';
import { BulkEnrollDialog } from '@/components/users/BulkEnrollDialog';

export default function CohortsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedCohortId, setSelectedCohortId] = useState<number>(0);
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);

  const handleSelectCohort = (id: number) => {
    if (id > 0) {
      router.push(`/admin/cohorts/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">{t('cohorts.title')}</h1>
        </div>
        <Button onClick={() => setShowBulkEnroll(true)}>
          <UserPlus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('enrollment.bulkEnroll')}
        </Button>
      </div>

      <CohortManager
        selectedCohortId={selectedCohortId}
        onSelectCohort={handleSelectCohort}
      />

      <BulkEnrollDialog isOpen={showBulkEnroll} onClose={() => setShowBulkEnroll(false)} />
    </div>
  );
}
