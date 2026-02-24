import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from '../Navbar';

// Mock NotificationBell to avoid QueryClient dependency
vi.mock('@/components/dashboard/NotificationBell', () => ({
  NotificationBell: () => <button aria-label="Notifications">bell</button>,
}));

// Mock auth context
const mockSignOut = vi.fn();
let mockAuth: Record<string, unknown> = {
  user: {
    givenName: 'John',
    familyName: 'Doe',
    email: 'john@example.com',
    role: 'STUDENT',
  },
  role: 'STUDENT',
  isAuthenticated: true,
  signOut: mockSignOut,
};
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Mock i18n context
let mockLocale = 'en';
const mockSetLocale = vi.fn();
vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    locale: mockLocale,
    setLocale: mockSetLocale,
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.signOut': 'Sign Out',
      };
      return map[key] || key;
    },
    formatDate: (d: Date) => d.toISOString(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockLocale = 'en';
  mockAuth = {
    user: {
      givenName: 'John',
      familyName: 'Doe',
      email: 'john@example.com',
      role: 'STUDENT',
    },
    role: 'STUDENT',
    isAuthenticated: true,
    signOut: mockSignOut,
  };
});

describe('Navbar', () => {
  it('renders user initials and name', () => {
    render(<Navbar />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Switch to Thai')).toBeInTheDocument();
  });

  it('toggles locale from en to th on language button click', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText('Switch to Thai'));
    expect(mockSetLocale).toHaveBeenCalledWith('th');
  });

  it('opens user menu on click and shows email', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', async () => {
    render(<Navbar />);
    // Open menu
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    // Click sign out
    fireEvent.click(screen.getByText('Sign Out'));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('closes user menu on outside click', () => {
    render(<Navbar />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });
});
