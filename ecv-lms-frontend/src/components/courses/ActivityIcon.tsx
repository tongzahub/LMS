'use client';

import {
  ClipboardCheck,
  FileEdit,
  MessageSquare,
  BookOpen,
  Gamepad2,
  File,
  Link,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  quiz: ClipboardCheck,
  assign: FileEdit,
  forum: MessageSquare,
  lesson: BookOpen,
  h5pactivity: Gamepad2,
  resource: File,
  url: Link,
  page: FileText,
};

interface ActivityIconProps {
  modname: string;
  className?: string;
}

export function ActivityIcon({ modname, className = 'w-4 h-4' }: ActivityIconProps) {
  const Icon = iconMap[modname] ?? HelpCircle;
  return <Icon className={className} aria-hidden="true" />;
}

/** Exported for testing */
export { iconMap };
