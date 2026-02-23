'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

const resetSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a digit'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword, confirmResetPassword } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const onEmailSubmit = async (data: EmailFormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setEmail(data.email);
      setStep('reset');
    } catch {
      setError('Unable to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      await confirmResetPassword(email, data.code, data.newPassword);
      router.push('/login');
    } catch {
      setError('Unable to reset password. Please check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Reset Password</h2>

      {step === 'email' ? (
        <div key="email-step">
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email to receive a verification code
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />
            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Send Code
            </Button>
          </form>
        </div>
      ) : (
        <div key="reset-step">
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter the code sent to <span className="font-medium">{email}</span> and your new password
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4" noValidate>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              {...resetForm.register('code')}
              error={resetForm.formState.errors.code?.message}
            />
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              {...resetForm.register('newPassword')}
              error={resetForm.formState.errors.newPassword?.message}
              helperText="Min 8 characters, with uppercase, lowercase, and a digit"
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              {...resetForm.register('confirmPassword')}
              error={resetForm.formState.errors.confirmPassword?.message}
            />
            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Sign In
        </Link>
      </p>
    </Card>
  );
}
