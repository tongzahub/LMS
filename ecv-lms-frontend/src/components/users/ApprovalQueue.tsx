'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';
import { apiFetch } from '@/lib/api/fetch';
import { CheckCircle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';

interface PendingRegistration extends Record<string, unknown> {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  requestedAt: string;
  status: 'pending';
  institution?: string;
  department?: string;
}

type ConfirmAction = 'approve' | 'reject';

function useApprovalQueue() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PendingRegistration[]>(
        '/api/moodle/users?status=pending',
      );
      setRegistrations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  return { registrations, isLoading, error, refetch: fetchRegistrations };
}

export function ApprovalQueue() {
  const { t, formatDate } = useI18n();
  const { registrations, isLoading, error, refetch } = useApprovalQueue();

  const [selectedUser, setSelectedUser] = useState<PendingRegistration | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAction = async () => {
    if (!selectedUser || !confirmAction) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/moodle/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: confirmAction }),
      });
      setConfirmAction(null);
      setSelectedUser(null);
      refetch();
    } catch {
      // Error handled by apiFetch
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedUser || !infoMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/moodle/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'request-info', message: infoMessage }),
      });
      setIsRequestInfoOpen(false);
      setInfoMessage('');
      setSelectedUser(null);
      refetch();
    } catch {
      // Error handled by apiFetch
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<PendingRegistration>[] = [
    {
      key: 'name',
      header: t('auth.firstName') + ' / ' + t('auth.lastName'),
      render: (row) => `${row.firstname} ${row.lastname}`,
    },
    { key: 'email', header: t('auth.email') },
    {
      key: 'institution',
      header: t('users.institution'),
      render: (row) => row.institution || '—',
    },
    {
      key: 'requestedAt',
      header: t('approvals.requestedAt'),
      render: (row) => formatDate(new Date(row.requestedAt)),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: () => <StatusBadge status="pending" label={t('approvals.pending')} />,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSelectedUser(row); setConfirmAction('approve'); }}
            aria-label={t('approvals.approve')}
          >
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSelectedUser(row); setConfirmAction('reject'); }}
            aria-label={t('approvals.reject')}
          >
            <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSelectedUser(row); setInfoMessage(''); setIsRequestInfoOpen(true); }}
            aria-label={t('approvals.requestInfo')}
          >
            <MessageSquare className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          {t('common.retry')}
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {registrations.length} {t('approvals.pendingCount')}
        </p>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {t('approvals.refresh')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={registrations}
        getRowKey={(r) => r.id}
        searchable
        searchPlaceholder={t('approvals.searchPlaceholder')}
        emptyMessage={t('approvals.noRegistrations')}
      />

      {/* Approve / Reject confirmation */}
      <ConfirmDialog
        isOpen={confirmAction !== null && selectedUser !== null}
        onClose={() => { setConfirmAction(null); setSelectedUser(null); }}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === 'approve'
            ? t('approvals.approveTitle')
            : t('approvals.rejectTitle')
        }
        message={
          confirmAction === 'approve'
            ? t('approvals.approveMessage')
            : t('approvals.rejectMessage')
        }
        confirmLabel={
          confirmAction === 'approve'
            ? t('approvals.approve')
            : t('approvals.reject')
        }
        variant={confirmAction === 'reject' ? 'danger' : 'primary'}
        isLoading={isSubmitting}
      />

      {/* Request info modal */}
      <Modal
        isOpen={isRequestInfoOpen}
        onClose={() => { setIsRequestInfoOpen(false); setSelectedUser(null); setInfoMessage(''); }}
        title={t('approvals.requestInfoTitle')}
      >
        <p className="text-sm text-gray-600 mb-3">
          {selectedUser
            ? `${selectedUser.firstname} ${selectedUser.lastname} (${selectedUser.email})`
            : ''}
        </p>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-24"
          rows={4}
          placeholder={t('approvals.requestInfoPlaceholder')}
          value={infoMessage}
          onChange={(e) => setInfoMessage(e.target.value)}
          aria-label={t('approvals.requestInfoPlaceholder')}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => { setIsRequestInfoOpen(false); setSelectedUser(null); setInfoMessage(''); }}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRequestInfo}
            isLoading={isSubmitting}
            disabled={!infoMessage.trim()}
          >
            {t('approvals.sendRequest')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
