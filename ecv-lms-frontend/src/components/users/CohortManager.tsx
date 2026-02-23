'use client';

import { useState } from 'react';
import { Plus, Users, Trash2, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/contexts/I18nContext';
import {
  useCohorts,
  useCreateCohort,
  useCohortMembers,
  useAddCohortMembers,
  useRemoveCohortMembers,
  type Cohort,
  type CohortMember,
} from '@/hooks/useCohorts';
import { useUsers, type UserListItem } from '@/hooks/useUsers';

interface CohortManagerProps {
  selectedCohortId?: number;
  onSelectCohort?: (id: number) => void;
}

export function CohortManager({ selectedCohortId, onSelectCohort }: CohortManagerProps) {
  const { t } = useI18n();
  const { data: cohorts, isLoading, error } = useCohorts();
  const createCohort = useCreateCohort();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCohort.mutateAsync({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    setShowCreate(false);
  };

  const columns: DataTableColumn<Cohort & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: t('cohorts.name'),
      render: (c) => (
        <button
          className="text-blue-600 hover:underline font-medium text-left"
          onClick={() => onSelectCohort?.(c.id)}
        >
          {c.name}
        </button>
      ),
    },
    { key: 'description', header: t('cohorts.description') },
    {
      key: 'memberCount',
      header: t('cohorts.members'),
      render: (c) => (
        <span className="inline-flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {c.memberCount ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectCohort?.(c.id)}
          aria-label={`${t('cohorts.manage')} ${c.name}`}
        >
          <Users className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('cohorts.manage')}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="40px" />
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600" role="alert">
        {t('common.error')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('cohorts.title')}</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('cohorts.create')}
        </Button>
      </div>

      {selectedCohortId ? (
        <CohortMemberPanel
          cohortId={selectedCohortId}
          cohortName={cohorts?.find((c) => c.id === selectedCohortId)?.name ?? ''}
          onBack={() => onSelectCohort?.(0)}
        />
      ) : (
        <DataTable
          columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
          data={(cohorts ?? []) as unknown as Record<string, unknown>[]}
          pageSize={10}
          getRowKey={(c) => c.id as number}
          emptyMessage={t('cohorts.noCohorts')}
        />
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('cohorts.create')}>
        <div className="space-y-4">
          <Input
            placeholder={t('cohorts.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={t('cohorts.name')}
          />
          <Input
            placeholder={t('cohorts.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label={t('cohorts.description')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} isLoading={createCohort.isPending} disabled={!name.trim()}>
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


/* ── Cohort Member Panel ── */

interface CohortMemberPanelProps {
  cohortId: number;
  cohortName: string;
  onBack: () => void;
}

function CohortMemberPanel({ cohortId, cohortName, onBack }: CohortMemberPanelProps) {
  const { t } = useI18n();
  const { data: members, isLoading } = useCohortMembers(cohortId);
  const { data: allUsers } = useUsers();
  const addMembers = useAddCohortMembers();
  const removeMembers = useRemoveCohortMembers();

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [removeTarget, setRemoveTarget] = useState<CohortMember | null>(null);

  const memberUserIds = new Set(members?.map((m) => m.userid) ?? []);

  // Users not already in this cohort
  const availableUsers = (allUsers ?? []).filter(
    (u) => !memberUserIds.has(u.id) && (
      !search ||
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ),
  );

  // Resolve member user details
  const memberDetails = (members ?? []).map((m) => {
    const user = allUsers?.find((u) => u.id === m.userid);
    return { ...m, name: user ? `${user.firstname} ${user.lastname}` : `User #${m.userid}`, email: user?.email ?? '' };
  });

  const handleAddMembers = async () => {
    if (selected.length === 0) return;
    await addMembers.mutateAsync(selected.map((userid) => ({ cohortid: cohortId, userid })));
    setSelected([]);
    setShowAdd(false);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    await removeMembers.mutateAsync([removeTarget]);
    setRemoveTarget(null);
  };

  const toggleSelect = (userId: number) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const memberColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: t('auth.firstName') + ' / ' + t('auth.lastName') },
    { key: 'email', header: t('auth.email') },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => setRemoveTarget({ cohortid: cohortId, userid: row.userid as number })}
          aria-label={`${t('cohorts.removeMember')} ${row.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <button onClick={onBack} className="text-blue-600 hover:underline mr-2">
              ← {t('common.back')}
            </button>
            {cohortName} — {t('cohorts.members')}
          </CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <UserPlus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('cohorts.addMembers')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height="200px" />
        ) : (
          <DataTable
            columns={memberColumns}
            data={memberDetails as unknown as Record<string, unknown>[]}
            pageSize={10}
            getRowKey={(r) => r.userid as number}
            emptyMessage={t('cohorts.noMembers')}
          />
        )}
      </CardContent>

      {/* Add members modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={t('cohorts.addMembers')}>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t('common.search') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label={t('common.search')}
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
            {availableUsers.length === 0 && (
              <p className="p-4 text-sm text-gray-500 text-center">{t('common.noResults')}</p>
            )}
            {availableUsers.slice(0, 50).map((u) => (
              <label key={u.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  {u.firstname} {u.lastname} <span className="text-gray-400">({u.email})</span>
                </span>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <p className="text-sm text-gray-600">
              {selected.length} {t('cohorts.selectedUsers')}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddMembers} isLoading={addMembers.isPending} disabled={selected.length === 0}>
              {t('cohorts.addMembers')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove confirmation */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title={t('cohorts.removeMemberTitle')}
        message={t('cohorts.removeMemberMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={removeMembers.isPending}
      />
    </Card>
  );
}
