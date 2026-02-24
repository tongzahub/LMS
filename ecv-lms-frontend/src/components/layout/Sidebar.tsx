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
  X,
  Settings,
  Film,
  FolderOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  section?: 'main' | 'teaching' | 'admin';
}

export const NAV_ITEMS: NavItem[] = [
  // Student items
  { label: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'TEACHER', 'ADMIN'], section: 'main' },
  { label: 'nav.courses', href: '/courses', icon: BookOpen, roles: ['STUDENT', 'TEACHER', 'ADMIN'], section: 'main' },
  { label: 'nav.learningPlans', href: '/learning-plans', icon: ClipboardList, roles: ['STUDENT', 'TEACHER', 'ADMIN'], section: 'main' },
  { label: 'nav.grades', href: '/grades', icon: GraduationCap, roles: ['STUDENT', 'TEACHER', 'ADMIN'], section: 'main' },
  // Teacher items
  { label: 'nav.managedCourses', href: '/teacher/courses', icon: BookMarked, roles: ['TEACHER', 'ADMIN'], section: 'teaching' },
  { label: 'nav.studentProgress', href: '/teacher/progress', icon: TrendingUp, roles: ['TEACHER', 'ADMIN'], section: 'teaching' },
  { label: 'nav.grading', href: '/teacher/grading', icon: PenLine, roles: ['TEACHER', 'ADMIN'], section: 'teaching' },
  { label: 'nav.planManagement', href: '/teacher/plans', icon: FileStack, roles: ['TEACHER', 'ADMIN'], section: 'teaching' },
  // Admin items
  { label: 'nav.courseManagement', href: '/admin/courses', icon: FolderOpen, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.videoLibrary', href: '/admin/videos', icon: Film, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.users', href: '/admin/users', icon: Users, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.cohorts', href: '/admin/cohorts', icon: UsersRound, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.reports', href: '/admin/reports', icon: BarChart3, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.auditLog', href: '/admin/audit-log', icon: FileText, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.competencies', href: '/admin/competencies', icon: Award, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.planTemplates', href: '/admin/plan-templates', icon: FileStack, roles: ['ADMIN'], section: 'admin' },
  { label: 'nav.siteSettings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'], section: 'admin' },
];

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

const SECTION_LABELS: Record<string, string> = {
  teaching: 'Teaching',
  admin: 'Administration',
};

export function Sidebar({ mobileOpen = false, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const { role } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const items = getNavItemsForRole(role);

  // Group items by section
  const sections = ['main', 'teaching', 'admin'] as const;
  const groupedItems = sections
    .map((section) => ({
      section,
      label: SECTION_LABELS[section],
      items: items.filter((item) => (item.section ?? 'main') === section),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <>
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight">ECV LMS</span>
            <p className="text-[10px] text-gray-400 leading-tight">Learning Solutions</p>
          </div>
        </div>
        {/* Close button for mobile */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1" aria-label="Main navigation">
        {groupedItems.map((group, idx) => (
          <div key={group.section} className={idx > 0 ? 'mt-5' : ''}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                      {t(item.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-gray-200/80 bg-white h-full overflow-y-auto hidden lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl overflow-y-auto z-50 flex flex-col animate-slide-up">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
