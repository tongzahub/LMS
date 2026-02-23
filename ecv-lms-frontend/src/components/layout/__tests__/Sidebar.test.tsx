import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar, getNavItemsForRole, NAV_ITEMS } from '../Sidebar';

// Mock next/navigation
let mockPathname = '/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock auth context
let mockRole: any = 'STUDENT';
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ role: mockRole }),
}));

// Mock i18n context
vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.dashboard': 'Dashboard',
        'nav.courses': 'Courses',
        'nav.learningPlans': 'Learning Plans',
        'nav.grades': 'Grades',
        'nav.managedCourses': 'Managed Courses',
        'nav.studentProgress': 'Student Progress',
        'nav.grading': 'Grading',
        'nav.planManagement': 'Plan Management',
        'nav.users': 'Users',
        'nav.cohorts': 'Cohorts',
        'nav.reports': 'Reports',
        'nav.auditLog': 'Audit Log',
        'nav.competencies': 'Competencies',
        'nav.planTemplates': 'Plan Templates',
      };
      return map[key] || key;
    },
    formatDate: (d: Date) => d.toISOString(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname = '/dashboard';
  mockRole = 'STUDENT';
});

describe('getNavItemsForRole', () => {
  it('returns empty array for null role', () => {
    expect(getNavItemsForRole(null)).toEqual([]);
  });

  it('returns student items for STUDENT role', () => {
    const items = getNavItemsForRole('STUDENT');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('nav.dashboard');
    expect(labels).toContain('nav.courses');
    expect(labels).toContain('nav.learningPlans');
    expect(labels).toContain('nav.grades');
    expect(labels).not.toContain('nav.users');
    expect(labels).not.toContain('nav.managedCourses');
  });

  it('returns student + teacher items for TEACHER role', () => {
    const items = getNavItemsForRole('TEACHER');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('nav.dashboard');
    expect(labels).toContain('nav.courses');
    expect(labels).toContain('nav.managedCourses');
    expect(labels).toContain('nav.studentProgress');
    expect(labels).toContain('nav.grading');
    expect(labels).toContain('nav.planManagement');
    expect(labels).not.toContain('nav.users');
    expect(labels).not.toContain('nav.cohorts');
  });

  it('returns all items for ADMIN role', () => {
    const items = getNavItemsForRole('ADMIN');
    const labels = items.map((i) => i.label);
    expect(labels).toContain('nav.dashboard');
    expect(labels).toContain('nav.courses');
    expect(labels).toContain('nav.managedCourses');
    expect(labels).toContain('nav.users');
    expect(labels).toContain('nav.cohorts');
    expect(labels).toContain('nav.reports');
    expect(labels).toContain('nav.auditLog');
    expect(labels).toContain('nav.competencies');
    expect(labels).toContain('nav.planTemplates');
    // Admin gets all items
    expect(items.length).toBe(NAV_ITEMS.length);
  });
});

describe('Sidebar', () => {
  it('renders student navigation items for STUDENT role', () => {
    mockRole = 'STUDENT';
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Learning Plans')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Managed Courses')).not.toBeInTheDocument();
  });

  it('renders teacher navigation items for TEACHER role', () => {
    mockRole = 'TEACHER';
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Managed Courses')).toBeInTheDocument();
    expect(screen.getByText('Student Progress')).toBeInTheDocument();
    expect(screen.getByText('Grading')).toBeInTheDocument();
    expect(screen.getByText('Plan Management')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('renders all navigation items for ADMIN role', () => {
    mockRole = 'ADMIN';
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Cohorts')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('Competencies')).toBeInTheDocument();
    expect(screen.getByText('Plan Templates')).toBeInTheDocument();
  });

  it('highlights active link based on current pathname', () => {
    mockRole = 'STUDENT';
    mockPathname = '/dashboard';
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    const coursesLink = screen.getByText('Courses').closest('a');
    expect(coursesLink).not.toHaveAttribute('aria-current');
  });

  it('highlights parent route for nested paths', () => {
    mockRole = 'ADMIN';
    mockPathname = '/admin/users/123';
    render(<Sidebar />);
    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders navigation landmark', () => {
    mockRole = 'STUDENT';
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
