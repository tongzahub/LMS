'use client';

import { CourseCatalog } from '@/components/courses/CourseCatalog';
import { useI18n } from '@/contexts/I18nContext';

export default function CoursesPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('courses.catalog')}</h1>
      <CourseCatalog />
    </div>
  );
}
