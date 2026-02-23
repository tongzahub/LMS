'use client';

import { useState } from 'react';
import { useAssignTemplate } from '@/hooks/useCompetencies';
import { useI18n } from '@/contexts/I18nContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserPlus } from 'lucide-react';

interface TemplateAssignDialogProps {
  templateId: number;
  onClose: () => void;
}

const placeholderUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@example.com' },
];

export function TemplateAssignDialog({ templateId, onClose }: TemplateAssignDialogProps) {
  const { t } = useI18n();
  const assignMutation = useAssignTemplate();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const filtered = placeholderUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAssign = async () => {
    if (!selectedUserId) return;
    await assignMutation.mutateAsync({ templateId, userId: selectedUserId });
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title={t('templateManagement.assignToUser')}>
      <div className="space-y-4">
        <Input
          label={t('templateManagement.searchUsers')}
          placeholder={t('templateManagement.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100" role="listbox" aria-label={t('templateManagement.searchUsers')}>
          {filtered.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                role="option"
                aria-selected={selectedUserId === user.id}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  selectedUserId === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-gray-400">{user.email}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId}
            isLoading={assignMutation.isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('templateManagement.assign')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
