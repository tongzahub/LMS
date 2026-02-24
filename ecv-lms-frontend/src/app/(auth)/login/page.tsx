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
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn(data.email, data.password);
      if (result.isSignedIn) {
        router.push(redirect);
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      }
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl shadow-gray-200/50 border-gray-200/60 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400">or continue with</span>
        </div>
      </div>

      <SocialLoginButtons disabled={isSubmitting} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </Card>
  );
}
