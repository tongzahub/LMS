'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';

const courseMetadataSchema = z.object({
  fullname: z.string().min(1, 'Course title is required'),
  shortname: z.string().min(1, 'Short name is required').max(50),
  summary: z.string().optional(),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  duration: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  language: z.string().optional(),
  credits: z.coerce.number().min(0).optional(),
  tags: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxEnrollment: z.coerce.number().min(0).optional(),
});

export type CourseMetadataValues = z.infer<typeof courseMetadataSchema>;

interface CourseMetadataFormProps {
  defaultValues?: Partial<CourseMetadataValues>;
  onSubmit: (data: CourseMetadataValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CourseMetadataForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: CourseMetadataFormProps) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseMetadataValues>({
    resolver: zodResolver(courseMetadataSchema),
    defaultValues: {
      fullname: '',
      shortname: '',
      summary: '',
      categoryId: 0,
      difficulty: undefined,
      language: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('courseManagement.title')}
          error={errors.fullname?.message}
          {...register('fullname')}
        />
        <Input
          label={t('courseManagement.shortname')}
          error={errors.shortname?.message}
          {...register('shortname')}
        />
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          {t('courseManagement.description')}
        </label>
        <textarea
          id="summary"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...register('summary')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('courseManagement.category')}
          type="number"
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            {t('courses.difficulty')}
          </label>
          <select
            id="difficulty"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('difficulty')}
          >
            <option value="">{t('courses.allDifficulties')}</option>
            <option value="beginner">{t('courses.beginner')}</option>
            <option value="intermediate">{t('courses.intermediate')}</option>
            <option value="advanced">{t('courses.advanced')}</option>
            <option value="expert">{t('courses.expert')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label={t('courses.language')} {...register('language')} />
        <Input label={t('courses.credits')} type="number" {...register('credits')} />
        <Input label={t('courses.duration')} {...register('duration')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('courseManagement.startDate')} type="date" {...register('startDate')} />
        <Input label={t('courseManagement.endDate')} type="date" {...register('endDate')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('courseManagement.maxEnrollment')} type="number" {...register('maxEnrollment')} />
        <Input label={t('courseManagement.tags')} helperText={t('courseManagement.tagsHelper')} {...register('tags')} />
      </div>

      <Input label={t('courseManagement.imageUrl')} error={errors.imageUrl?.message} {...register('imageUrl')} />

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {submitLabel || t('common.save')}
        </Button>
      </div>
    </form>
  );
}
