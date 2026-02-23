'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Shield, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MFASetup } from '@/components/auth/MFASetup';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [mfaMethod, setMfaMethod] = useState<'TOTP' | 'SMS' | 'NONE'>('NONE');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.givenName ?? '',
      lastName: user?.familyName ?? '',
      phone: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = (_data: ProfileFormData) => {
    // Placeholder — no API call yet
  };

  const onPasswordSubmit = (_data: PasswordFormData) => {
    // Placeholder — no API call yet
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('profile.firstName')}
                {...profileForm.register('firstName')}
                error={profileForm.formState.errors.firstName?.message}
              />
              <Input
                label={t('profile.lastName')}
                {...profileForm.register('lastName')}
                error={profileForm.formState.errors.lastName?.message}
              />
            </div>
            <Input
              label={t('profile.email')}
              value={user?.email ?? ''}
              disabled
            />
            <Input
              label={t('profile.phone')}
              {...profileForm.register('phone')}
              error={profileForm.formState.errors.phone?.message}
            />
            <div className="flex justify-end">
              <Button type="submit">{t('profile.saveChanges')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('profile.changePassword')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label={t('profile.currentPassword')}
              type="password"
              {...passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <Input
              label={t('profile.newPassword')}
              type="password"
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <Input
              label={t('profile.confirmNewPassword')}
              type="password"
              {...passwordForm.register('confirmNewPassword')}
              error={passwordForm.formState.errors.confirmNewPassword?.message}
            />
            <div className="flex justify-end">
              <Button type="submit">{t('profile.changePassword')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings (MFA) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('profile.securitySettings')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <MFASetup currentMethod={mfaMethod} onMethodChange={setMfaMethod} />
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('profile.languagePreference')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={locale === 'en' ? 'primary' : 'outline'}
              onClick={() => setLocale('en')}
            >
              {t('profile.english')}
            </Button>
            <Button
              variant={locale === 'th' ? 'primary' : 'outline'}
              onClick={() => setLocale('th')}
            >
              {t('profile.thai')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
