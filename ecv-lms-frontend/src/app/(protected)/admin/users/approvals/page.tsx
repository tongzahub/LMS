'use client';

import { ApprovalQueue } from '@/components/users/ApprovalQueue';
import { useI18n } from '@/contexts/I18nContext';

export default function ApprovalsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t('approvals.title')}
      </h1>
      <ApprovalQueue />
    </div>
  );
}
