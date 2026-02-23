'use client';

import { useState } from 'react';
import {
  useCompetencies,
  useCreateCompetency,
  type Competency,
} from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRight, ChevronDown, Plus, FolderTree } from 'lucide-react';

interface CompetencyTreeProps {
  frameworkId: number;
}

function flattenCompetencies(competencies: Competency[]): { id: number; name: string; depth: number }[] {
  const result: { id: number; name: string; depth: number }[] = [];
  function walk(items: Competency[], depth: number) {
    for (const c of items) {
      result.push({ id: c.id, name: c.name, depth });
      if (c.children?.length) walk(c.children, depth + 1);
    }
  }
  walk(competencies, 0);
  return result;
}

function TreeNode({ competency }: { competency: Competency }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = competency.children?.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1 py-1.5 px-2 rounded hover:bg-gray-50">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:bg-gray-200"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="text-sm font-medium text-gray-900">{competency.name}</span>
        <span className="text-xs text-gray-500 ml-1">({competency.shortname})</span>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-5 border-l border-gray-200">
          {competency.children.map((child) => (
            <TreeNode key={child.id} competency={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CompetencyTree({ frameworkId }: CompetencyTreeProps) {
  const { t } = useI18n();
  const { data: competencies, isLoading } = useCompetencies(frameworkId);
  const createCompetency = useCreateCompetency();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [shortname, setShortname] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompetency.mutate(
      { name, shortname, description, frameworkId, parentId },
      {
        onSuccess: () => {
          setShowAdd(false);
          setName('');
          setShortname('');
          setDescription('');
          setParentId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" width={`${60 + i * 5}%`} />
        ))}
      </div>
    );
  }

  const allFlat = competencies ? flattenCompetencies(competencies) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <FolderTree className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{t('competencyManagement.competencyTree')}</h2>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          {t('competencyManagement.addCompetency')}
        </Button>
      </div>

      {!competencies?.length ? (
        <p className="text-gray-500 text-sm">{t('competencyManagement.noCompetencies')}</p>
      ) : (
        <ul className="space-y-0.5" role="tree">
          {competencies.map((c) => (
            <TreeNode key={c.id} competency={c} />
          ))}
        </ul>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={t('competencyManagement.addCompetency')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('competencyManagement.competencyName')}
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
          <div className="w-full">
            <label htmlFor="parent-competency" className="block text-sm font-medium text-gray-700 mb-1">
              {t('competencyManagement.parentCompetency')}
            </label>
            <select
              id="parent-competency"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{t('competencyManagement.noParent')}</option>
              {allFlat.map((c) => (
                <option key={c.id} value={c.id}>
                  {'—'.repeat(c.depth)} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={createCompetency.isPending}>
              {t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
