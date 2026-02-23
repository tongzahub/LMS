import React from 'react';

export type BadgeStatus = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'draft';

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}
      role="status"
      aria-label={displayLabel}
    >
      {displayLabel}
    </span>
  );
}

export { StatusBadge };
