'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import type { UserRole } from '@/lib/auth/types';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
  UsersRound,
  BarChart3,
  FileText,
  Award,
  FileStack,
  BookMarked,
  TrendingUp,
  PenLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  // Student items
  { label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
  { label: 'nav.courses', href: '/courses', icon: BookOpen, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
  { label: 'nav.learningPlans', href: '/learning-plans', icon: ClipboardList, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
  { label: 'nav.grades', href: '/grades', icon: GraduationCap, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
  // Teacher items
  { label: 'nav.managedCourses', href: '/teacher/courses', icon: BookMarked, roles: ['TEACHER', 'ADMIN'] },
  { label: 'nav.studentProgress', href: '/teacher/progress', icon: TrendingUp, roles: ['TEACHER', 'ADMIN'] },
  { label: 'nav.grading', href: '/teacher/grading', icon: PenLine, roles: ['TEACHER', 'ADMIN'] },
  { label: 'nav.planManagement', href: '/teacher/plans', icon: FileStack, roles: ['TEACHER', 'ADMIN'] },
  // Admin items
  { label: 'nav.users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { label: 'nav.cohorts', href: '/admin/cohorts', icon: UsersRound, roles: ['ADMIN'] },
  { label: 'nav.reports', href: '/admin/reports', icon: BarChart3, roles: ['ADMIN'] },
  { label: 'nav.auditLog', href: '/admin/audit-log', icon: FileText, roles: ['ADMIN'] },
  { label: 'nav.competencies', href: '/admin/competencies', icon: Award, roles: ['ADMIN'] },
  { label: 'nav.planTemplates', href: '/admin/plan-templates', icon: FileStack, roles: ['ADMIN'] },
];

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function Sidebar() {
  const { role } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const items = getNavItemsForRole(role);

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-full overflow-y-auto hidden lg:block">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">ECV LMS</span>
      </div>
      <nav className="p-2" aria-label="Main navigation">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {t(item.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
