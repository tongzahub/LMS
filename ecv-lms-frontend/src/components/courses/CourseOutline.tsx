'use client';

import type { CourseSection } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionCard } from './SectionCard';

interface CourseOutlineProps {
  sections: CourseSection[];
  isEnrolled: boolean;
  isLoading?: boolean;
}

export function CourseOutline({ sections, isEnrolled, isLoading }: CourseOutlineProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="64px" />
        ))}
      </div>
    );
  }

  // Calculate overall progress
  const allModules = sections.flatMap((s) => s.modules);
  const totalModules = allModules.length;
  const completedModules = allModules.filter((m) => m.completionState === 'completed').length;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div>
      {/* Overall progress bar for enrolled students */}
      {isEnrolled && totalModules > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('dashboard.progress')}</span>
            <span className="text-xs text-gray-500">
              {completedModules}/{totalModules} {t('courses.completed').toLowerCase()}
            </span>
          </div>
          <ProgressBar value={progress} size="md" showLabel />
        </div>
      )}

      {/* Section heading */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {t('courses.sections')} ({sections.length})
      </h2>

      {/* Section list */}
      <div className="space-y-2">
        {sections
          .filter((s) => s.visible)
          .sort((a, b) => a.sectionNumber - b.sectionNumber)
          .map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              isEnrolled={isEnrolled}
              defaultExpanded={idx === 0}
            />
          ))}
      </div>
    </div>
  );
}
