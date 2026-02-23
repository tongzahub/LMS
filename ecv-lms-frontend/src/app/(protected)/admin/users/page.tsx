'use client';

import { UserTable } from '@/components/users/UserTable';
import { useI18n } from '@/contexts/I18nContext';

export default function AdminUsersPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t('users.userList')}
      </h1>
      <UserTable />
    </div>
  );
}
