'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge, type BadgeStatus } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/contexts/I18nContext';
import { useUsers, type UserListItem } from '@/hooks/useUsers';

const ROLE_OPTIONS = ['ALL', 'ADMIN', 'TEACHER', 'STUDENT'] as const;
const STATUS_OPTIONS = ['ALL', 'active', 'suspended', 'archived'] as const;

function statusToBadge(status: string): BadgeStatus {
  if (status === 'suspended') return 'warning';
  if (status === 'archived') return 'inactive';
  return 'active';
}

export function UserTable() {
  const { t, formatDate } = useI18n();
  const { data: users, isLoading, error } = useUsers();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cohortFilter, setCohortFilter] = useState<string>('ALL');

  // Collect unique cohorts from user data
  const cohortOptions = useMemo(() => {
    if (!users) return [];
    const set = new Set<string>();
    users.forEach((u) => u.cohorts.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [users]);

  // Client-side filtering
  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesCohort =
        cohortFilter === 'ALL' || u.cohorts.includes(cohortFilter);
      return matchesSearch && matchesRole && matchesStatus && matchesCohort;
    });
  }, [users, search, roleFilter, statusFilter, cohortFilter]);

  const columns: DataTableColumn<UserListItem>[] = [
    {
      key: 'name',
      header: t('auth.firstName') + ' / ' + t('auth.lastName'),
      render: (u) => (
        <Link
          href={`/admin/users/${u.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {u.firstname} {u.lastname}
        </Link>
      ),
    },
    { key: 'email', header: t('auth.email') },
    {
      key: 'role',
      header: t('users.role'),
      render: (u) => (
        <span className="capitalize text-sm">{t(`users.${u.role.toLowerCase()}`)}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (u) => (
        <StatusBadge
          status={statusToBadge(u.status)}
          label={t(`users.${u.status}`)}
        />
      ),
    },
    {
      key: 'enrolledCoursesCount',
      header: t('users.enrolledCoursesCount'),
      render: (u) => <span>{u.enrolledCoursesCount}</span>,
    },
    {
      key: 'lastLogin',
      header: t('users.lastLogin'),
      render: (u) =>
        u.lastLogin ? formatDate(new Date(u.lastLogin)) : '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (u) => (
        <Link
          href={`/admin/users/${u.id}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          aria-label={`View ${u.firstname} ${u.lastname}`}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Link>
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
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
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
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('users.role')}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === 'ALL' ? t('users.role') : t(`users.${r.toLowerCase()}`)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('common.status')}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? t('common.status') : t(`users.${s}`)}
            </option>
          ))}
        </select>

        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Cohort"
        >
          <option value="ALL">Cohort</option>
          {cohortOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns as unknown as DataTableColumn<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        pageSize={10}
        getRowKey={(u) => u.id as number}
        emptyMessage={t('common.noResults')}
      />
    </div>
  );
}
