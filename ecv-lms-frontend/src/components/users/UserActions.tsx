'use client';

import { useState } from 'react';
import { Ban, RefreshCw, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useI18n } from '@/contexts/I18nContext';
import {
  useSuspendUser,
  useReactivateUser,
  useDeleteUser,
} from '@/hooks/useUsers';

interface UserActionsProps {
  userId: number;
  userName: string;
  status: 'active' | 'suspended' | 'archived';
  onSuccess?: () => void;
}

export function UserActions({ userId, userName, status, onSuccess }: UserActionsProps) {
  const { t } = useI18n();
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const deleteUser = useDeleteUser();

  const [showSuspend, setShowSuspend] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'delete'>('archive');
  const [exportBeforeDelete, setExportBeforeDelete] = useState(true);

  const handleSuspend = async () => {
    await suspendUser.mutateAsync(userId);
    setShowSuspend(false);
    onSuccess?.();
  };

  const handleReactivate = async () => {
    await reactivateUser.mutateAsync(userId);
    setShowReactivate(false);
    onSuccess?.();
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync({ id: userId, mode: deleteMode, exportData: exportBeforeDelete });
    setShowDelete(false);
    onSuccess?.();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === 'active' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuspend(true)}
            aria-label={`${t('users.suspend')} ${userName}`}
          >
            <Ban className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('users.suspend')}
          </Button>
        )}

        {status === 'suspended' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReactivate(true)}
            aria-label={`${t('users.reactivate')} ${userName}`}
          >
            <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('users.reactivate')}
          </Button>
        )}

        {status !== 'archived' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDelete(true)}
            aria-label={`${t('common.delete')} ${userName}`}
          >
            <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('common.delete')}
          </Button>
        )}
      </div>

      {/* Suspend confirmation */}
      <ConfirmDialog
        isOpen={showSuspend}
        onClose={() => setShowSuspend(false)}
        onConfirm={handleSuspend}
        title={t('users.suspendConfirmTitle')}
        message={t('users.suspendConfirmMessage')}
        confirmLabel={t('users.suspend')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={suspendUser.isPending}
      />

      {/* Reactivate confirmation */}
      <ConfirmDialog
        isOpen={showReactivate}
        onClose={() => setShowReactivate(false)}
        onConfirm={handleReactivate}
        title={t('users.reactivateConfirmTitle')}
        message={t('users.reactivateConfirmMessage')}
        confirmLabel={t('users.reactivate')}
        cancelLabel={t('common.cancel')}
        isLoading={reactivateUser.isPending}
      />

      {/* Delete/Archive dialog with PDPA options */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('users.deleteConfirmTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('users.deleteConfirmMessage')}</p>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              {t('users.dataRetention')}
            </legend>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  value="archive"
                  checked={deleteMode === 'archive'}
                  onChange={() => setDeleteMode('archive')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{t('users.archiveOption')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  value="delete"
                  checked={deleteMode === 'delete'}
                  onChange={() => setDeleteMode('delete')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{t('users.deleteOption')}</span>
              </label>
            </div>
          </fieldset>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportBeforeDelete}
              onChange={(e) => setExportBeforeDelete(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <Download className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <span className="text-sm">{t('users.exportBeforeDelete')}</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteUser.isPending}
            >
              {deleteMode === 'archive' ? t('users.archived') : t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
