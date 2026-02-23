'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';
import { useUsers, type UserListItem } from '@/hooks/useUsers';
import {
  generateUserExportCsv,
  filterUsersForExport,
  EXPORTABLE_FIELDS,
  type ExportableUser,
} from '@/lib/csv/processor';

interface UserExportDialogProps {
  onClose: () => void;
}

export function UserExportDialog({ onClose }: UserExportDialogProps) {
  const { t } = useI18n();
  const { data: users = [] } = useUsers();

  const [selectedFields, setSelectedFields] = useState<string[]>([
    'email', 'firstname', 'lastname', 'role', 'status',
  ]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleField = useCallback((field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  }, []);

  const getFilteredUsers = useCallback((): ExportableUser[] => {
    const exportable: ExportableUser[] = users.map((u: UserListItem) => ({
      ...u,
      cohorts: u.cohorts,
    }));
    return filterUsersForExport(exportable, {
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      cohort: cohortFilter || undefined,
      dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
    });
  }, [users, roleFilter, statusFilter, cohortFilter, dateFrom, dateTo]);

  const handleExport = useCallback(() => {
    const filtered = getFilteredUsers();
    const csv = generateUserExportCsv(filtered, selectedFields);
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  }, [getFilteredUsers, selectedFields, onClose]);

  const filteredCount = getFilteredUsers().length;

  return (
    <div className="space-y-4">
      {/* Field selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('csv.selectFields')}</h4>
        <div className="flex flex-wrap gap-2">
          {EXPORTABLE_FIELDS.map((field) => (
            <label
              key={field}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                selectedFields.includes(field)
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => toggleField(field)}
                className="sr-only"
              />
              {field}
            </label>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('common.filter')}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('users.role')}</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('users.role')}
            >
              <option value="">{t('csv.allRoles')}</option>
              <option value="ADMIN">{t('users.admin')}</option>
              <option value="TEACHER">{t('users.teacher')}</option>
              <option value="STUDENT">{t('users.student')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('common.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('common.status')}
            >
              <option value="">{t('csv.allStatuses')}</option>
              <option value="active">{t('users.active')}</option>
              <option value="suspended">{t('users.suspended')}</option>
              <option value="archived">{t('users.archived')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('csv.dateFrom')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('csv.dateFrom')}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('csv.dateTo')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('csv.dateTo')}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-500">
          {filteredCount} {t('csv.usersToExport')}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            onClick={handleExport}
            disabled={selectedFields.length === 0 || filteredCount === 0}
          >
            <Download className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('common.export')}
          </Button>
        </div>
      </div>
    </div>
  );
}
