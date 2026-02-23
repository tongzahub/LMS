'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFrameworks } from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, BookOpen, Link2 } from 'lucide-react';

export function FrameworkManager() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: frameworks, isLoading } = useFrameworks();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [shortname, setShortname] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — no create framework API yet
    setShowCreate(false);
    setName('');
    setShortname('');
    setDescription('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="2rem" width="14rem" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height="10rem" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('competencyManagement.frameworks')}
        </h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('competencyManagement.createFramework')}
        </Button>
      </div>

      {!frameworks?.length ? (
        <p className="text-gray-500">{t('competencyManagement.noFrameworks')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((fw) => (
            <Card
              key={fw.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/competencies/${fw.id}`)}
            >
              <CardHeader>
                <CardTitle>{fw.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {fw.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{fw.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {t('competencyManagement.competencyCount', { count: String(fw.competencyCount) })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    {t('competencyManagement.linkedCourses', { count: String(fw.linkedCourseCount) })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('competencyManagement.createFramework')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('competencyManagement.frameworkName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t('competencyManagement.shortname')}
            value={shortname}
            onChange={(e) => setShortname(e.target.value)}
            required
          />
          <Input
            label={t('competencyManagement.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
