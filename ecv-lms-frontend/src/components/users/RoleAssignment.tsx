'use client';

import { useState } from 'react';
import { UserCog } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useI18n } from '@/contexts/I18nContext';
import { useAssignRole } from '@/hooks/useUsers';

interface RoleAssignmentProps {
  userId: number;
  currentRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  onSuccess?: () => void;
}

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;

export function RoleAssignment({ userId, currentRole, onSuccess }: RoleAssignmentProps) {
  const { t } = useI18n();
  const assignRole = useAssignRole();
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>(currentRole);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'ADMIN' | 'TEACHER' | 'STUDENT';
    setSelectedRole(newRole);
    if (newRole !== currentRole) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    await assignRole.mutateAsync({ userId, role: selectedRole });
    setShowConfirm(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setSelectedRole(currentRole);
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-3">
      <UserCog className="h-4 w-4 text-gray-500" aria-hidden="true" />
      <div className="flex-1">
        <label htmlFor={`role-${userId}`} className="block text-sm font-medium text-gray-700 mb-1">
          {t('users.cognitoGroup')}
        </label>
        <select
          id={`role-${userId}`}
          value={selectedRole}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label={t('users.assignRole')}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`users.${role.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={t('users.assignRole')}
        message={`${t('users.roleAssignment')}: ${t(`users.${currentRole.toLowerCase()}`)} → ${t(`users.${selectedRole.toLowerCase()}`)}`}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        isLoading={assignRole.isPending}
      />
    </div>
  );
}
