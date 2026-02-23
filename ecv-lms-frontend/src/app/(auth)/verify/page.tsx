'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const verifySchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const { confirmSignUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({ resolver: zodResolver(verifySchema) });

  const onSubmit = async (data: VerifyFormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      await confirmSignUp(email, data.code);
      router.push('/login');
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Verify Email</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter the verification code sent to{' '}
        {email ? <span className="font-medium">{email}</span> : 'your email'}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Verification Code"
          placeholder="Enter 6-digit code"
          autoComplete="one-time-code"
          {...register('code')}
          error={errors.code?.message}
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Verify
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Sign In
        </Link>
      </p>
    </Card>
  );
}
