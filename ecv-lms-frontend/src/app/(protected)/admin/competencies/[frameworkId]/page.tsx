'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFrameworkDetail } from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { CompetencyTree } from '@/components/learning-plans/CompetencyTree';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft } from 'lucide-react';

export default function FrameworkDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const frameworkId = Number(params.frameworkId);
  const { data: framework, isLoading } = useFrameworkDetail(frameworkId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/competencies"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.back')}
        </Link>
      </div>

      {isLoading ? (
        <Skeleton variant="text" width="16rem" height="2rem" />
      ) : (
        <h1 className="text-2xl font-bold text-gray-900">{framework?.name}</h1>
      )}

      <CompetencyTree frameworkId={frameworkId} />
    </div>
  );
}
