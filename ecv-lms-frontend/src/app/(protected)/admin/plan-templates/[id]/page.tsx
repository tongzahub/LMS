'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TemplateAssignDialog } from '@/components/learning-plans/TemplateAssignDialog';
import { FileText, Users, Calendar, ArrowLeft, UserPlus } from 'lucide-react';

export default function TemplateDetailPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: templates, isLoading } = useTemplates();
  const [showAssign, setShowAssign] = useState(false);

  const template = templates?.find((tpl) => tpl.id === id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="2rem" width="14rem" />
        <Skeleton variant="rectangular" height="20rem" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/admin/plan-templates')}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.back')}
        </button>
        <p className="text-gray-500">{t('templateManagement.noTemplates')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/plan-templates')}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.back')}
        </button>
        <Button onClick={() => setShowAssign(true)}>
          <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('templateManagement.assignToUser')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{template.name}</CardTitle>
            <StatusBadge status={template.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.description && (
            <p className="text-sm text-gray-600">{template.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              {t('templateManagement.assignedUsers', { count: String(template.assignedUserCount) })}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t('templateManagement.assignedCohorts', { count: String(template.assignedCohortCount) })}
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              {t('templateManagement.competencies')}
            </h2>
            {!template.competencies.length ? (
              <p className="text-sm text-gray-500">{t('common.noResults')}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {template.competencies.map((comp) => (
                  <li key={comp.competencyId} className="py-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{comp.competencyName}</p>
                      <p className="text-xs text-gray-500">{comp.frameworkName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {showAssign && (
        <TemplateAssignDialog
          templateId={template.id}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}
