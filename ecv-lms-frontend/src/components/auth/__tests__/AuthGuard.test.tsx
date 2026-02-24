import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';
import type { AuthContextValue } from '@/contexts/AuthContext';

// Mock next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockPathname = '/dashboard';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => mockPathname,
}));

// Mock auth context — values controlled per test
let mockAuth = {
  user: null as AuthContextValue['user'],
  role: null as AuthContextValue['role'],
  isLoading: false,
  isAuthenticated: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  confirmSignUp: vi.fn(),
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
};
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname = '/dashboard';
  mockAuth = {
    user: null,
    role: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    confirmSignUp: vi.fn(),
    resetPassword: vi.fn(),
    confirmResetPassword: vi.fn(),
  };
});

describe('AuthGuard', () => {
  it('shows loading skeleton while auth is loading', () => {
    mockAuth.isLoading = true;
    render(<AuthGuard><div>Protected</div></AuthGuard>);
    const loadingElements = screen.getAllByRole('status', { name: 'Loading' });
    expect(loadingElements.length).toBeGreaterThan(0);
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login with redirect param', () => {
    mockPathname = '/admin/users';
    mockAuth.isAuthenticated = false;
    mockAuth.isLoading = false;
    render(<AuthGuard><div>Protected</div></AuthGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Fadmin%2Fusers');
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children for authenticated users with no role restriction', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'STUDENT';
    mockAuth.user = { givenName: 'John', familyName: 'Doe', email: 'john@test.com' };
    render(<AuthGuard><div>Protected Content</div></AuthGuard>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders children when user role is in allowedRoles', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'ADMIN';
    render(<AuthGuard allowedRoles={['ADMIN', 'TEACHER']}><div>Admin Page</div></AuthGuard>);
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('shows access denied when user role is not in allowedRoles', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'STUDENT';
    render(<AuthGuard allowedRoles={['ADMIN']}><div>Admin Page</div></AuthGuard>);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to access this page.')).toBeInTheDocument();
    expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
  });

  it('shows go to dashboard button on access denied', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'STUDENT';
    render(<AuthGuard allowedRoles={['ADMIN']}><div>Admin Page</div></AuthGuard>);
    const btn = screen.getByRole('button', { name: 'Go to Dashboard' });
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders children when allowedRoles is empty (no restriction)', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.role = 'STUDENT';
    render(<AuthGuard allowedRoles={[]}><div>Open Page</div></AuthGuard>);
    expect(screen.getByText('Open Page')).toBeInTheDocument();
  });

  it('encodes special characters in redirect path', () => {
    mockPathname = '/courses/123?tab=overview';
    mockAuth.isAuthenticated = false;
    mockAuth.isLoading = false;
    render(<AuthGuard><div>Protected</div></AuthGuard>);
    expect(mockReplace).toHaveBeenCalledWith(
      '/login?redirect=%2Fcourses%2F123%3Ftab%3Doverview'
    );
  });
});
