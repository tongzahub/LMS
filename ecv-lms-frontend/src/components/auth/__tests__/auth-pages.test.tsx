import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

// Mock aws-amplify/auth
vi.mock('aws-amplify/auth', () => ({
  signInWithRedirect: vi.fn(),
}));

// Mock auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockConfirmSignUp = vi.fn();
const mockResetPassword = vi.fn();
const mockConfirmResetPassword = vi.fn();
const mockAuthContext = {
  user: null,
  role: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: mockSignIn,
  signUp: mockSignUp,
  signOut: vi.fn(),
  confirmSignUp: mockConfirmSignUp,
  resetPassword: mockResetPassword,
  confirmResetPassword: mockConfirmResetPassword,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Import after mocks
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import VerifyPage from '@/app/(auth)/verify/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { SocialLoginButtons } from '../SocialLoginButtons';
import { signInWithRedirect } from 'aws-amplify/auth';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders sign in form with email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders forgot password and sign up links', () => {
    render(<LoginPage />);
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'notanemail');
    await user.type(screen.getByLabelText('Password'), 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn and redirects on success', async () => {
    mockSignIn.mockResolvedValue({ isSignedIn: true });
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password1');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows generic error on failed sign in', async () => {
    mockSignIn.mockRejectedValue(new Error('NotAuthorizedException'));
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('renders social login buttons', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Facebook')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Apple')).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  it('renders registration form with all fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('validates password policy', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.type(screen.getByLabelText('Confirm Password'), 'short');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('validates password match', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password2');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp and redirects to verify on success', async () => {
    mockSignUp.mockResolvedValue({ isSignUpComplete: false });
    render(<RegisterPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password1',
        givenName: 'John',
        familyName: 'Doe',
      });
      expect(mockPush).toHaveBeenCalledWith('/verify?email=john%40example.com');
    });
  });

  it('shows generic error on signUp failure', async () => {
    mockSignUp.mockRejectedValue(new Error('UsernameExistsException'));
    render(<RegisterPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(screen.getByText('Unable to create account. Please try again.')).toBeInTheDocument();
    });
  });
});


describe('VerifyPage', () => {
  beforeEach(() => {
    mockSearchParams.set('email', 'john@example.com');
  });

  it('renders verification form with email displayed', () => {
    render(<VerifyPage />);
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
  });

  it('validates required code field', async () => {
    render(<VerifyPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => {
      expect(screen.getByText('Verification code is required')).toBeInTheDocument();
    });
    expect(mockConfirmSignUp).not.toHaveBeenCalled();
  });

  it('calls confirmSignUp and redirects to login on success', async () => {
    mockConfirmSignUp.mockResolvedValue(undefined);
    render(<VerifyPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Verification Code'), '123456');
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => {
      expect(mockConfirmSignUp).toHaveBeenCalledWith('john@example.com', '123456');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error on invalid code', async () => {
    mockConfirmSignUp.mockRejectedValue(new Error('CodeMismatchException'));
    render(<VerifyPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Verification Code'), '000000');
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid verification code. Please try again.')).toBeInTheDocument();
    });
  });
});

describe('ForgotPasswordPage', () => {
  it('renders email step initially', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Code' })).toBeInTheDocument();
  });

  it('validates email field', async () => {
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('transitions to reset step after sending code', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    render(<ForgotPasswordPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('john@example.com');
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
    });
  });

  it('validates password policy on reset step', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    render(<ForgotPasswordPage />);
    const user = userEvent.setup();

    // Go to reset step
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    // Submit with weak password
    await user.type(screen.getByLabelText('Verification Code'), '123456');
    await user.type(screen.getByLabelText('New Password'), 'weak');
    await user.type(screen.getByLabelText('Confirm Password'), 'weak');
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
    expect(mockConfirmResetPassword).not.toHaveBeenCalled();
  });

  it('calls confirmResetPassword and redirects on success', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    mockConfirmResetPassword.mockResolvedValue(undefined);
    render(<ForgotPasswordPage />);
    const user = userEvent.setup();

    // Go to reset step
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    // Complete reset — click into each field explicitly
    await user.click(screen.getByLabelText('Verification Code'));
    await user.keyboard('123456');
    await user.click(screen.getByLabelText('New Password'));
    await user.keyboard('NewPass1');
    await user.click(screen.getByLabelText('Confirm Password'));
    await user.keyboard('NewPass1');
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    await waitFor(() => {
      expect(mockConfirmResetPassword).toHaveBeenCalledWith('john@example.com', '123456', 'NewPass1');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});

describe('SocialLoginButtons', () => {
  it('renders all three provider buttons', () => {
    render(<SocialLoginButtons />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Facebook')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Apple')).toBeInTheDocument();
  });

  it('calls signInWithRedirect with Google', async () => {
    render(<SocialLoginButtons />);
    fireEvent.click(screen.getByText('Sign in with Google'));
    expect(signInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' });
  });

  it('calls signInWithRedirect with Facebook', async () => {
    render(<SocialLoginButtons />);
    fireEvent.click(screen.getByText('Sign in with Facebook'));
    expect(signInWithRedirect).toHaveBeenCalledWith({ provider: 'Facebook' });
  });

  it('calls signInWithRedirect with Apple', async () => {
    render(<SocialLoginButtons />);
    fireEvent.click(screen.getByText('Sign in with Apple'));
    expect(signInWithRedirect).toHaveBeenCalledWith({ provider: 'Apple' });
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<SocialLoginButtons disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
