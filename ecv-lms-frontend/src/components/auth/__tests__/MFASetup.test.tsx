import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock aws-amplify/auth
const mockSetUpTOTP = vi.fn();
const mockVerifyTOTPSetup = vi.fn();
const mockUpdateMFAPreference = vi.fn();

vi.mock('aws-amplify/auth', () => ({
  setUpTOTP: (...args: unknown[]) => mockSetUpTOTP(...args),
  verifyTOTPSetup: (...args: unknown[]) => mockVerifyTOTPSetup(...args),
  updateMFAPreference: (...args: unknown[]) => mockUpdateMFAPreference(...args),
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      cognitoSub: 'sub-123',
      email: 'test@example.com',
      givenName: 'Test',
      familyName: 'User',
      role: 'STUDENT',
      moodleUserId: 1,
      locale: 'en',
    },
    role: 'STUDENT',
    isLoading: false,
    isAuthenticated: true,
  }),
}));

import { MFASetup } from '../MFASetup';

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateMFAPreference.mockResolvedValue(undefined);
});

describe('MFASetup', () => {
  describe('initial rendering', () => {
    it('renders MFA title and description', () => {
      render(<MFASetup />);
      expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Add an extra layer of security to your account')).toBeInTheDocument();
    });

    it('renders TOTP and SMS setup cards', () => {
      render(<MFASetup />);
      expect(screen.getByText('Authenticator App')).toBeInTheDocument();
      expect(screen.getByText('SMS Verification')).toBeInTheDocument();
    });

    it('shows setup buttons when no MFA is configured', () => {
      render(<MFASetup currentMethod="NONE" />);
      expect(screen.getByRole('button', { name: 'Set Up Authenticator' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Set Up SMS' })).toBeInTheDocument();
    });

    it('does not show preference selector when MFA is NONE', () => {
      render(<MFASetup currentMethod="NONE" />);
      expect(screen.queryByText('Preferred MFA Method')).not.toBeInTheDocument();
    });
  });

  describe('TOTP setup flow', () => {
    it('generates QR code and shows secret on setup start', async () => {
      mockSetUpTOTP.mockResolvedValue({
        sharedSecret: 'ABCDEF123456',
        getSetupUri: () => ({ toString: () => 'otpauth://totp/ECV%20LMS:test@example.com?secret=ABCDEF123456' }),
      });

      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up Authenticator' }));

      await waitFor(() => {
        expect(screen.getByTestId('totp-qr-code')).toBeInTheDocument();
        expect(screen.getByTestId('totp-secret')).toHaveTextContent('ABCDEF123456');
      });
      expect(screen.getByText('Scan the QR code below with your authenticator app')).toBeInTheDocument();
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    it('shows error when setup fails', async () => {
      mockSetUpTOTP.mockRejectedValue(new Error('SetupFailed'));

      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up Authenticator' }));

      await waitFor(() => {
        expect(screen.getByText('MFA setup failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('validates TOTP code is required before verify', async () => {
      mockSetUpTOTP.mockResolvedValue({
        sharedSecret: 'SECRET',
        getSetupUri: () => ({ toString: () => 'otpauth://totp/test' }),
      });

      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up Authenticator' }));

      await waitFor(() => {
        expect(screen.getByTestId('totp-qr-code')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Verify/ }));

      await waitFor(() => {
        expect(screen.getByText('Verification code is required')).toBeInTheDocument();
      });
      expect(mockVerifyTOTPSetup).not.toHaveBeenCalled();
    });

    it('verifies TOTP code and calls onMethodChange on success', async () => {
      mockSetUpTOTP.mockResolvedValue({
        sharedSecret: 'SECRET',
        getSetupUri: () => ({ toString: () => 'otpauth://totp/test' }),
      });
      mockVerifyTOTPSetup.mockResolvedValue(undefined);
      const onMethodChange = vi.fn();

      render(<MFASetup onMethodChange={onMethodChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up Authenticator' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      fireEvent.click(screen.getByRole('button', { name: /Verify/ }));

      await waitFor(() => {
        expect(mockVerifyTOTPSetup).toHaveBeenCalledWith({ code: '123456' });
        expect(mockUpdateMFAPreference).toHaveBeenCalledWith({ totp: 'PREFERRED' });
        expect(onMethodChange).toHaveBeenCalledWith('TOTP');
      });
    });

    it('shows error on invalid TOTP code', async () => {
      mockSetUpTOTP.mockResolvedValue({
        sharedSecret: 'SECRET',
        getSetupUri: () => ({ toString: () => 'otpauth://totp/test' }),
      });
      mockVerifyTOTPSetup.mockRejectedValue(new Error('CodeMismatch'));

      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up Authenticator' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Verification Code'), '000000');
      fireEvent.click(screen.getByRole('button', { name: /Verify/ }));

      await waitFor(() => {
        expect(screen.getByText('Invalid verification code. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('SMS setup flow', () => {
    it('shows phone input on SMS setup start', () => {
      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Code' })).toBeInTheDocument();
    });

    it('validates phone number is required', async () => {
      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));
      fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Phone Number'), 'notaphone');
      fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByText('Enter a valid phone number (e.g. +66812345678)')).toBeInTheDocument();
      });
    });

    it('transitions to verify step after sending code', async () => {
      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Phone Number'), '+66812345678');
      fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Verify/ })).toBeInTheDocument();
      });
    });

    it('validates SMS code is required', async () => {
      render(<MFASetup />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Phone Number'), '+66812345678');
      fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Verify/ })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Verify/ }));

      await waitFor(() => {
        expect(screen.getByText('Verification code is required')).toBeInTheDocument();
      });
    });

    it('verifies SMS code and calls onMethodChange on success', async () => {
      const onMethodChange = vi.fn();
      render(<MFASetup onMethodChange={onMethodChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Set Up SMS' }));

      const user = userEvent.setup();
      await user.type(screen.getByLabelText('Phone Number'), '+66812345678');
      fireEvent.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Verification Code'), '654321');
      fireEvent.click(screen.getByRole('button', { name: /Verify/ }));

      await waitFor(() => {
        expect(mockUpdateMFAPreference).toHaveBeenCalledWith({ sms: 'PREFERRED' });
        expect(onMethodChange).toHaveBeenCalledWith('SMS');
      });
    });
  });

  describe('enabled state and disable', () => {
    it('shows enabled status for TOTP', () => {
      render(<MFASetup currentMethod="TOTP" />);
      expect(screen.getByText('Authenticator app is enabled')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Disable' })[0]).toBeInTheDocument();
    });

    it('shows enabled status for SMS', () => {
      render(<MFASetup currentMethod="SMS" />);
      expect(screen.getByText('SMS verification is enabled')).toBeInTheDocument();
    });

    it('calls disable and notifies on method change', async () => {
      const onMethodChange = vi.fn();
      render(<MFASetup currentMethod="TOTP" onMethodChange={onMethodChange} />);

      fireEvent.click(screen.getAllByRole('button', { name: 'Disable' })[0]);

      await waitFor(() => {
        expect(mockUpdateMFAPreference).toHaveBeenCalledWith({ totp: 'DISABLED', sms: 'DISABLED' });
        expect(onMethodChange).toHaveBeenCalledWith('NONE');
      });
    });
  });

  describe('MFA preference selector', () => {
    it('shows preference selector when MFA is enabled', () => {
      render(<MFASetup currentMethod="TOTP" />);
      expect(screen.getByText('Preferred MFA Method')).toBeInTheDocument();
      expect(screen.getByLabelText('Authenticator App')).toBeChecked();
    });

    it('changes preference to SMS', async () => {
      const onMethodChange = vi.fn();
      render(<MFASetup currentMethod="TOTP" onMethodChange={onMethodChange} />);

      fireEvent.click(screen.getByLabelText('SMS'));

      await waitFor(() => {
        expect(mockUpdateMFAPreference).toHaveBeenCalledWith({ sms: 'PREFERRED', totp: 'DISABLED' });
        expect(onMethodChange).toHaveBeenCalledWith('SMS');
      });
    });

    it('changes preference to None', async () => {
      const onMethodChange = vi.fn();
      render(<MFASetup currentMethod="TOTP" onMethodChange={onMethodChange} />);

      fireEvent.click(screen.getByLabelText('None'));

      await waitFor(() => {
        expect(mockUpdateMFAPreference).toHaveBeenCalledWith({ totp: 'DISABLED', sms: 'DISABLED' });
        expect(onMethodChange).toHaveBeenCalledWith('NONE');
      });
    });
  });
});
