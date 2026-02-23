'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, FileText, Users, Calendar } from 'lucide-react';

export function TemplateManager() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: templates, isLoading } = useTemplates();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateMode, setDueDateMode] = useState<'fixed' | 'relative'>('fixed');
  const [relativeDays, setRelativeDays] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — no create template API yet
    setShowCreate(false);
    setName('');
    setDescription('');
    setDueDateMode('fixed');
    setRelativeDays('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="2rem" width="14rem" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height="12rem" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('templateManagement.templates')}
        </h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('templateManagement.createTemplate')}
        </Button>
      </div>

      {!templates?.length ? (
        <p className="text-gray-500">{t('templateManagement.noTemplates')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/plan-templates/${tpl.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tpl.name}</CardTitle>
                  <StatusBadge status={tpl.status} />
                </div>
              </CardHeader>
              <CardContent>
                {tpl.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tpl.description}</p>
                )}
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t('templateManagement.competencies')}: {tpl.competencies.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {t('templateManagement.assignedUsers', { count: String(tpl.assignedUserCount) })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {t('templateManagement.assignedCohorts', { count: String(tpl.assignedCohortCount) })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('templateManagement.createTemplate')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('templateManagement.templateName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t('templateManagement.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('templateManagement.dueDateMode')}
            </label>
            <select
              value={dueDateMode}
              onChange={(e) => setDueDateMode(e.target.value as 'fixed' | 'relative')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fixed">{t('templateManagement.fixed')}</option>
              <option value="relative">{t('templateManagement.relative')}</option>
            </select>
          </div>
          {dueDateMode === 'relative' && (
            <Input
              label={t('templateManagement.relativeDays')}
              type="number"
              value={relativeDays}
              onChange={(e) => setRelativeDays(e.target.value)}
              min="1"
            />
          )}
          <p className="text-sm text-gray-500">
            {t('templateManagement.competencies')}: {t('common.noResults')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
