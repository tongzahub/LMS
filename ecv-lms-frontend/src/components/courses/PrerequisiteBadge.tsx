'use client';

import { Lock } from 'lucide-react';

interface PrerequisiteBadgeProps {
  message: string;
}

export function PrerequisiteBadge({ message }: PrerequisiteBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
      <Lock className="w-3 h-3" aria-hidden="true" />
      <span>{message}</span>
    </span>
  );
}
