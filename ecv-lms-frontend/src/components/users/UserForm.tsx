'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';
import { useCreateUser, useUpdateUser, type UserListItem } from '@/hooks/useUsers';

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  password: z.string().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  phone: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface UserFormProps {
  user?: UserListItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { t } = useI18n();
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? userSchema : createUserSchema),
    defaultValues: {
      username: user?.email?.split('@')[0] ?? '',
      email: user?.email ?? '',
      firstname: user?.firstname ?? '',
      lastname: user?.lastname ?? '',
      password: '',
      role: user?.role ?? 'STUDENT',
      phone: '',
      institution: '',
      department: '',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (isEdit && user) {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          username: data.username,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
        },
      });
    } else {
      await createUser.mutateAsync({
        username: data.username,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        password: data.password,
        auth: data.role === 'TEACHER' ? 'manual' : undefined,
      });
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('auth.firstName')}
          {...register('firstname')}
          error={errors.firstname?.message}
          autoComplete="given-name"
        />
        <Input
          label={t('auth.lastName')}
          {...register('lastname')}
          error={errors.lastname?.message}
          autoComplete="family-name"
        />
      </div>

      <Input
        label={t('users.username')}
        {...register('username')}
        error={errors.username?.message}
        autoComplete="username"
      />

      <Input
        label={t('auth.email')}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        autoComplete="email"
      />

      {!isEdit && (
        <Input
          label={t('users.password')}
          type="password"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />
      )}

      <div className="w-full">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          {t('users.role')}
        </label>
        <select
          id="role"
          {...register('role')}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label={t('users.role')}
        >
          <option value="STUDENT">{t('users.student')}</option>
          <option value="TEACHER">{t('users.teacher')}</option>
          <option value="ADMIN">{t('users.admin')}</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.role.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('users.phone')}
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label={t('users.institution')}
          {...register('institution')}
          error={errors.institution?.message}
        />
      </div>

      <Input
        label={t('users.department')}
        {...register('department')}
        error={errors.department?.message}
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting || createUser.isPending || updateUser.isPending}
        >
          {isEdit ? t('common.save') : t('users.createUser')}
        </Button>
      </div>

      {(createUser.error || updateUser.error) && (
        <p className="text-sm text-red-600" role="alert">
          {createUser.error?.message || updateUser.error?.message}
        </p>
      )}
    </form>
  );
}
