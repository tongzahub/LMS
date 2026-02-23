'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { CourseSection, CourseModule } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Card } from '@/components/ui/Card';
import { ActivityIcon } from './ActivityIcon';
import { PrerequisiteBadge } from './PrerequisiteBadge';
import { MoodleLink } from '@/components/layout/MoodleLink';

function CompletionIcon({ state }: { state: CourseModule['completionState'] }) {
  switch (state) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" aria-label="Completed" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500 shrink-0" aria-label="In progress" />;
    default:
      return <Circle className="w-4 h-4 text-gray-300 shrink-0" aria-label="Not started" />;
  }
}

function ModuleRow({ module, isEnrolled }: { module: CourseModule; isEnrolled: boolean }) {
  const content = (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <ActivityIcon modname={module.modname} className="w-4 h-4 text-gray-500 shrink-0" />
      <span className={`text-sm flex-1 min-w-0 ${!module.available ? 'text-gray-400' : 'text-gray-700'}`}>
        {module.name}
      </span>
      {module.estimatedDuration && (
        <span className="text-xs text-gray-400 shrink-0">{module.estimatedDuration}</span>
      )}
      {isEnrolled && <CompletionIcon state={module.completionState} />}
    </div>
  );

  if (!module.available) {
    return (
      <li>
        {content}
        {module.prerequisiteMessage && (
          <div className="pl-10 pb-1">
            <PrerequisiteBadge message={module.prerequisiteMessage} />
          </div>
        )}
      </li>
    );
  }

  if (module.url && isEnrolled) {
    return (
      <li>
        <MoodleLink targetUrl={module.url} className="block">
          {content}
        </MoodleLink>
      </li>
    );
  }

  return <li>{content}</li>;
}

interface SectionCardProps {
  section: CourseSection;
  isEnrolled: boolean;
  defaultExpanded?: boolean;
}

export function SectionCard({ section, isEnrolled, defaultExpanded = false }: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { t } = useI18n();

  const completedCount = section.modules.filter((m) => m.completionState === 'completed').length;
  const totalCount = section.modules.length;

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{section.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalCount} {t('courses.activities')}
            {isEnrolled && ` · ${completedCount}/${totalCount} ${t('courses.completed').toLowerCase()}`}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          {section.learningObjectives && section.learningObjectives.length > 0 && (
            <div className="pt-3 pb-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Learning Objectives</p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                {section.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}
          <ul className="divide-y divide-gray-50">
            {section.modules.map((mod) => (
              <ModuleRow key={mod.id} module={mod} isEnrolled={isEnrolled} />
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
