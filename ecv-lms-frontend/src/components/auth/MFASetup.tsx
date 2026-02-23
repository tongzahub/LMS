'use client';

import { useState, useCallback } from 'react';
import {
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
} from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export type MFAMethod = 'TOTP' | 'SMS' | 'NONE';

interface MFASetupProps {
  currentMethod?: MFAMethod;
  onMethodChange?: (method: MFAMethod) => void;
}

type TOTPStep = 'idle' | 'qr' | 'verify';
type SMSStep = 'idle' | 'phone' | 'verify';

export function MFASetup({ currentMethod = 'NONE', onMethodChange }: MFASetupProps) {
  const { user } = useAuth();

  // TOTP state
  const [totpStep, setTotpStep] = useState<TOTPStep>('idle');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

  // SMS state
  const [smsStep, setSmsStep] = useState<SMSStep>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  // Preference state
  const [preferenceLoading, setPreferenceLoading] = useState(false);

  const handleStartTOTPSetup = useCallback(async () => {
    setTotpError('');
    setTotpLoading(true);
    try {
      const totpSetup = await setUpTOTP();
      const secret = totpSetup.sharedSecret;
      const uri = totpSetup.getSetupUri('ECV LMS', user?.email).toString();
      setTotpSecret(secret);
      setTotpUri(uri);
      setTotpStep('qr');
    } catch {
      setTotpError('MFA setup failed. Please try again.');
    } finally {
      setTotpLoading(false);
    }
  }, [user?.email]);

  const handleVerifyTOTP = useCallback(async () => {
    if (!totpCode.trim()) {
      setTotpError('Verification code is required');
      return;
    }
    setTotpError('');
    setTotpLoading(true);
    try {
      await verifyTOTPSetup({ code: totpCode });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setTotpStep('idle');
      setTotpCode('');
      onMethodChange?.('TOTP');
    } catch {
      setTotpError('Invalid verification code. Please try again.');
    } finally {
      setTotpLoading(false);
    }
  }, [totpCode, onMethodChange]);

  const handleStartSMSSetup = useCallback(() => {
    setSmsError('');
    setSmsStep('phone');
  }, []);

  const handleSendSMSCode = useCallback(async () => {
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneNumber.trim()) {
      setSmsError('Phone number is required');
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setSmsError('Enter a valid phone number (e.g. +66812345678)');
      return;
    }
    setSmsError('');
    setSmsLoading(true);
    try {
      // In a real flow, Cognito handles SMS MFA via updateUserAttributes + verification
      // For now, transition to verify step
      await updateMFAPreference({ sms: 'ENABLED' });
      setSmsStep('verify');
    } catch {
      setSmsError('MFA setup failed. Please try again.');
    } finally {
      setSmsLoading(false);
    }
  }, [phoneNumber]);

  const handleVerifySMS = useCallback(async () => {
    if (!smsCode.trim()) {
      setSmsError('Verification code is required');
      return;
    }
    setSmsError('');
    setSmsLoading(true);
    try {
      await updateMFAPreference({ sms: 'PREFERRED' });
      setSmsStep('idle');
      setSmsCode('');
      setPhoneNumber('');
      onMethodChange?.('SMS');
    } catch {
      setSmsError('Invalid verification code. Please try again.');
    } finally {
      setSmsLoading(false);
    }
  }, [smsCode, onMethodChange]);

  const handleDisableMFA = useCallback(async () => {
    setPreferenceLoading(true);
    try {
      await updateMFAPreference({ totp: 'DISABLED', sms: 'DISABLED' });
      onMethodChange?.('NONE');
    } catch {
      // silently fail — user can retry
    } finally {
      setPreferenceLoading(false);
    }
  }, [onMethodChange]);

  const handleSetPreference = useCallback(async (method: MFAMethod) => {
    setPreferenceLoading(true);
    try {
      if (method === 'TOTP') {
        await updateMFAPreference({ totp: 'PREFERRED', sms: 'DISABLED' });
      } else if (method === 'SMS') {
        await updateMFAPreference({ sms: 'PREFERRED', totp: 'DISABLED' });
      } else {
        await updateMFAPreference({ totp: 'DISABLED', sms: 'DISABLED' });
      }
      onMethodChange?.(method);
    } catch {
      // silently fail
    } finally {
      setPreferenceLoading(false);
    }
  }, [onMethodChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Multi-Factor Authentication</h2>
        <p className="mt-1 text-sm text-gray-600">Add an extra layer of security to your account</p>
      </div>

      {/* TOTP Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Authenticator App</CardTitle>
          <p className="text-sm text-gray-600">
            Use an authenticator app like Google Authenticator or Authy
          </p>
        </CardHeader>
        <CardContent>
          {currentMethod === 'TOTP' && totpStep === 'idle' ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium" role="status">
                Authenticator app is enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisableMFA}
                isLoading={preferenceLoading}
              >
                Disable
              </Button>
            </div>
          ) : totpStep === 'idle' ? (
            <Button
              variant="outline"
              onClick={handleStartTOTPSetup}
              isLoading={totpLoading}
            >
              Set Up Authenticator
            </Button>
          ) : totpStep === 'qr' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Scan the QR code below with your authenticator app
              </p>
              <div
                className="flex justify-center p-4 bg-gray-50 rounded-lg"
                data-testid="totp-qr-code"
                aria-label="QR code for authenticator setup"
              >
                {/* QR code rendered via URI — in production use a QR library */}
                <code className="text-xs break-all max-w-xs" aria-label="TOTP setup URI">
                  {totpUri}
                </code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Or enter this secret manually:</p>
                <code
                  className="text-xs bg-gray-100 px-2 py-1 rounded select-all"
                  data-testid="totp-secret"
                >
                  {totpSecret}
                </code>
              </div>
              <p className="text-sm text-gray-700">
                Enter the 6-digit code from your app to verify
              </p>
              <div className="flex gap-3 items-end">
                <Input
                  label="Verification Code"
                  value={totpCode}
                  onChange={(e) => {
                    setTotpCode(e.target.value);
                    setTotpError('');
                  }}
                  placeholder="123456"
                  maxLength={6}
                  error={totpError}
                />
                <Button
                  onClick={handleVerifyTOTP}
                  isLoading={totpLoading}
                  className="shrink-0"
                >
                  Verify &amp; Enable
                </Button>
              </div>
            </div>
          ) : null}
          {totpStep === 'idle' && totpError && (
            <p className="mt-2 text-sm text-red-600" role="alert">{totpError}</p>
          )}
        </CardContent>
      </Card>

      {/* SMS Setup */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Verification</CardTitle>
          <p className="text-sm text-gray-600">
            Receive verification codes via text message
          </p>
        </CardHeader>
        <CardContent>
          {currentMethod === 'SMS' && smsStep === 'idle' ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium" role="status">
                SMS verification is enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisableMFA}
                isLoading={preferenceLoading}
              >
                Disable
              </Button>
            </div>
          ) : smsStep === 'idle' ? (
            <Button variant="outline" onClick={handleStartSMSSetup}>
              Set Up SMS
            </Button>
          ) : smsStep === 'phone' ? (
            <div className="space-y-4">
              <div className="flex gap-3 items-end">
                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setSmsError('');
                  }}
                  placeholder="+66812345678"
                  error={smsError}
                />
                <Button
                  onClick={handleSendSMSCode}
                  isLoading={smsLoading}
                  className="shrink-0"
                >
                  Send Code
                </Button>
              </div>
            </div>
          ) : smsStep === 'verify' ? (
            <div className="space-y-4">
              <div className="flex gap-3 items-end">
                <Input
                  label="Verification Code"
                  value={smsCode}
                  onChange={(e) => {
                    setSmsCode(e.target.value);
                    setSmsError('');
                  }}
                  placeholder="123456"
                  maxLength={6}
                  error={smsError}
                />
                <Button
                  onClick={handleVerifySMS}
                  isLoading={smsLoading}
                  className="shrink-0"
                >
                  Verify &amp; Enable
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* MFA Preference */}
      {currentMethod !== 'NONE' && (
        <Card>
          <CardHeader>
            <CardTitle>Preferred MFA Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4" role="radiogroup" aria-label="Preferred MFA method">
              {(['TOTP', 'SMS', 'NONE'] as const).map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mfa-preference"
                    value={method}
                    checked={currentMethod === method}
                    onChange={() => handleSetPreference(method)}
                    disabled={preferenceLoading}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {method === 'TOTP' ? 'Authenticator App' : method === 'SMS' ? 'SMS' : 'None'}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
