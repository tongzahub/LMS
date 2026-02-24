import React from 'react';

export type BadgeStatus = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'draft';

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  active: 'bg-green-50 text-green-700 ring-green-600/10',
  inactive: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  success: 'bg-green-50 text-green-700 ring-green-600/10',
  error: 'bg-red-50 text-red-700 ring-red-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  draft: 'bg-gray-50 text-gray-600 ring-gray-500/10',
};

const defaultLabels: Record<BadgeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  draft: 'Draft',
};

function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const displayLabel = label || defaultLabels[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset ${statusStyles[status]} ${className}`}
      role="status"
      aria-label={displayLabel}
    >
      {displayLabel}
    </span>
  );
}

export { StatusBadge };
