'use client';

import { useI18n } from '@/contexts/I18nContext';
import { CourseCreationWizard } from '@/components/courses/CourseCreationWizard';

export default function CreateCoursePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t('courseManagement.createCourse')}
      </h1>
      <CourseCreationWizard />
    </div>
  );
}
