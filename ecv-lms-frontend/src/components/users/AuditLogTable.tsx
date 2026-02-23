'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Shield } from 'lucide-react';

type ActionType = 'user_login' | 'user_created' | 'course_enrollment' | 'role_change' | 'settings_change';

interface AuditEntry {
  id: number;
  date: string;
  user: string;
  action: ActionType;
  details: string;
}

const ACTION_TYPE_KEYS: Record<ActionType, string> = {
  user_login: 'auditLog.userLogin',
  user_created: 'auditLog.userCreated',
  course_enrollment: 'auditLog.courseEnrollment',
  role_change: 'auditLog.roleChange',
  settings_change: 'auditLog.settingsChange',
};

const PLACEHOLDER_ENTRIES: AuditEntry[] = [
  { id: 1, date: '2025-06-15T09:23:00', user: 'Somchai P.', action: 'user_login', details: 'Logged in from 192.168.1.10' },
  { id: 2, date: '2025-06-15T08:45:00', user: 'Admin', action: 'user_created', details: 'Created user: Nattaya K.' },
  { id: 3, date: '2025-06-14T16:30:00', user: 'Kanya S.', action: 'course_enrollment', details: 'Enrolled 25 students in Data Science 101' },
  { id: 4, date: '2025-06-14T14:12:00', user: 'Admin', action: 'role_change', details: 'Changed Prasit W. role from Student to Teacher' },
  { id: 5, date: '2025-06-14T10:05:00', user: 'Admin', action: 'settings_change', details: 'Updated site maintenance window' },
  { id: 6, date: '2025-06-13T17:50:00', user: 'Anong T.', action: 'user_login', details: 'Logged in from 10.0.0.5' },
  { id: 7, date: '2025-06-13T11:20:00', user: 'Admin', action: 'user_created', details: 'Created user: Wichai R.' },
  { id: 8, date: '2025-06-12T09:00:00', user: 'Kanya S.', action: 'course_enrollment', details: 'Enrolled 10 students in Thai Literature' },
];

export function AuditLogTable() {
  const { t, formatDate } = useI18n();
  const [userSearch, setUserSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return PLACEHOLDER_ENTRIES.filter((entry) => {
      if (userSearch && !entry.user.toLowerCase().includes(userSearch.toLowerCase())) {
        return false;
      }
      if (actionFilter !== 'all' && entry.action !== actionFilter) {
        return false;
      }
      if (dateFrom && entry.date < dateFrom) {
        return false;
      }
      if (dateTo && entry.date > dateTo + 'T23:59:59') {
        return false;
      }
      return true;
    });
  }, [userSearch, actionFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" />
        {t('auditLog.title')}
      </h1>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                label={t('auditLog.user')}
                placeholder={t('auditLog.searchUser')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auditLog.actionType')}
              </label>
              <select
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">{t('auditLog.allActions')}</option>
                <option value="user_login">{t('auditLog.userLogin')}</option>
                <option value="user_created">{t('auditLog.userCreated')}</option>
                <option value="course_enrollment">{t('auditLog.courseEnrollment')}</option>
                <option value="role_change">{t('auditLog.roleChange')}</option>
                <option value="settings_change">{t('auditLog.settingsChange')}</option>
              </select>
            </div>
            <div className="min-w-[150px]">
              <Input
                label={t('auditLog.dateFrom')}
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="min-w-[150px]">
              <Input
                label={t('auditLog.dateTo')}
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('auditLog.date')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('auditLog.user')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('auditLog.action')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('auditLog.details')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    {t('auditLog.noLogs')}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(new Date(entry.date))}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.user}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {t(ACTION_TYPE_KEYS[entry.action])}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
