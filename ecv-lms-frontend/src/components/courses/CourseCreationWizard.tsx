'use client';

import { useState, useCallback } from 'react';
import { StepWizard } from '@/components/ui/StepWizard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';
import { useCreateCourse, type CreateCourseParams } from '@/hooks/useCourses';
import { useFrameworks, useCompetencies } from '@/hooks/useCompetencies';
import { CourseMetadataForm, type CourseMetadataValues } from './CourseMetadataForm';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SectionDraft {
  name: string;
  summary: string;
}

interface EnrollmentConfig {
  selfEnrollment: boolean;
  manualEnrollment: boolean;
  cohortEnrollment: boolean;
  guestAccess: boolean;
  enrollmentKey: string;
  capacity: number;
}

interface CompletionConfig {
  type: 'all_activities' | 'specific_activities' | 'minimum_grade' | 'manual';
  value: string;
}

const WIZARD_STEPS = [
  { label: 'Metadata' },
  { label: 'Format' },
  { label: 'Sections' },
  { label: 'Competencies' },
  { label: 'Publish' },
];

export function CourseCreationWizard() {
  const { t } = useI18n();
  const router = useRouter();
  const createCourse = useCreateCourse();

  const [step, setStep] = useState(0);
  const [metadata, setMetadata] = useState<CourseMetadataValues | null>(null);
  const [format, setFormat] = useState<'weeks' | 'topics'>('topics');
  const [sections, setSections] = useState<SectionDraft[]>([{ name: '', summary: '' }]);
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<number[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number>(0);
  const [publishVisible, setPublishVisible] = useState(false);
  const [enrollment, setEnrollment] = useState<EnrollmentConfig>({
    selfEnrollment: true,
    manualEnrollment: true,
    cohortEnrollment: false,
    guestAccess: false,
    enrollmentKey: '',
    capacity: 0,
  });
  const [completion, setCompletion] = useState<CompletionConfig>({
    type: 'all_activities',
    value: '',
  });

  const { data: frameworks } = useFrameworks();
  const { data: competencies } = useCompetencies(selectedFrameworkId);

  const handleNext = useCallback(() => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1)), []);
  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleMetadataSubmit = (data: CourseMetadataValues) => {
    setMetadata(data);
    handleNext();
  };

  const addSection = () => setSections((prev) => [...prev, { name: '', summary: '' }]);
  const removeSection = (index: number) => setSections((prev) => prev.filter((_, i) => i !== index));
  const updateSection = (index: number, field: keyof SectionDraft, value: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const toggleCompetency = (id: number) => {
    setSelectedCompetencyIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handlePublish = async () => {
    if (!metadata) return;

    const enrollmentMethods = [
      { type: 'self', enabled: enrollment.selfEnrollment, key: enrollment.enrollmentKey || undefined, capacity: enrollment.capacity || undefined },
      { type: 'manual', enabled: enrollment.manualEnrollment },
      { type: 'cohort', enabled: enrollment.cohortEnrollment },
      { type: 'guest', enabled: enrollment.guestAccess },
    ];

    const params: CreateCourseParams = {
      fullname: metadata.fullname,
      shortname: metadata.shortname,
      summary: metadata.summary,
      categoryId: metadata.categoryId,
      format,
      startDate: metadata.startDate,
      endDate: metadata.endDate,
      visible: publishVisible,
      difficulty: metadata.difficulty,
      language: metadata.language,
      credits: metadata.credits,
      duration: metadata.duration,
      tags: metadata.tags ? metadata.tags.split(',').map((t) => t.trim()) : undefined,
      maxEnrollment: metadata.maxEnrollment,
      sections: sections.filter((s) => s.name.trim()),
      competencyIds: selectedCompetencyIds.length > 0 ? selectedCompetencyIds : undefined,
      enrollmentMethods,
      completionCriteria: [{ type: completion.type, value: completion.value || undefined }],
    };

    await createCourse.mutateAsync(params);
    router.push('/admin/courses');
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <CourseMetadataForm
            defaultValues={metadata ?? undefined}
            onSubmit={handleMetadataSubmit}
            submitLabel={t('common.next')}
          />
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t('courseManagement.selectFormat')}</p>
            <div className="grid grid-cols-2 gap-4">
              {(['topics', 'weeks'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    format === f ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{t(`courseManagement.format_${f}`)}</p>
                  <p className="text-sm text-gray-500 mt-1">{t(`courseManagement.format_${f}_desc`)}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>{t('common.back')}</Button>
              <Button onClick={handleNext}>{t('common.next')}</Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{t('courseManagement.addSections')}</p>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('courseManagement.addSection')}
              </Button>
            </div>
            <div className="space-y-3">
              {sections.map((section, index) => (
                <Card key={index} padding="sm">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-2 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={t('courseManagement.sectionName')}
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder={t('courseManagement.sectionSummary')}
                        value={section.summary}
                        onChange={(e) => updateSection(index, 'summary', e.target.value)}
                      />
                    </div>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>{t('common.back')}</Button>
              <Button onClick={handleNext}>{t('common.next')}</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t('courseManagement.mapCompetencies')}</p>
            <div>
              <label htmlFor="framework-select" className="block text-sm font-medium text-gray-700 mb-1">
                {t('courseManagement.framework')}
              </label>
              <select
                id="framework-select"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFrameworkId}
                onChange={(e) => setSelectedFrameworkId(Number(e.target.value))}
              >
                <option value={0}>{t('courseManagement.selectFramework')}</option>
                {frameworks?.map((fw) => (
                  <option key={fw.id} value={fw.id}>{fw.name}</option>
                ))}
              </select>
            </div>
            {competencies && competencies.length > 0 && (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {competencies.map((comp) => (
                  <label key={comp.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCompetencyIds.includes(comp.id)}
                      onChange={() => toggleCompetency(comp.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{comp.name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>{t('common.back')}</Button>
              <Button onClick={handleNext}>{t('common.next')}</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Visibility toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('courseManagement.visibility')}</p>
                <p className="text-sm text-gray-500">{t('courseManagement.visibilityDesc')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={publishVisible}
                onClick={() => setPublishVisible((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  publishVisible ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    publishVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Enrollment configuration */}
            <Card padding="md">
              <h3 className="font-medium text-gray-900 mb-3">{t('courseManagement.enrollmentSettings')}</h3>
              <div className="space-y-3">
                {([
                  ['selfEnrollment', 'courseManagement.selfEnrollment'],
                  ['manualEnrollment', 'courseManagement.manualEnrollment'],
                  ['cohortEnrollment', 'courseManagement.cohortEnrollment'],
                  ['guestAccess', 'courseManagement.guestAccess'],
                ] as const).map(([key, labelKey]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enrollment[key]}
                      onChange={(e) => setEnrollment((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t(labelKey)}</span>
                  </label>
                ))}
                {enrollment.selfEnrollment && (
                  <div className="grid grid-cols-2 gap-3 pl-7">
                    <Input
                      label={t('courseManagement.enrollmentKey')}
                      value={enrollment.enrollmentKey}
                      onChange={(e) => setEnrollment((prev) => ({ ...prev, enrollmentKey: e.target.value }))}
                    />
                    <Input
                      label={t('courseManagement.capacityLimit')}
                      type="number"
                      value={enrollment.capacity || ''}
                      onChange={(e) => setEnrollment((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Completion criteria */}
            <Card padding="md">
              <h3 className="font-medium text-gray-900 mb-3">{t('courseManagement.completionCriteria')}</h3>
              <div className="space-y-3">
                {([
                  ['all_activities', 'courseManagement.completionAll'],
                  ['specific_activities', 'courseManagement.completionSpecific'],
                  ['minimum_grade', 'courseManagement.completionGrade'],
                  ['manual', 'courseManagement.completionManual'],
                ] as const).map(([value, labelKey]) => (
                  <label key={value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="completion"
                      value={value}
                      checked={completion.type === value}
                      onChange={() => setCompletion({ type: value, value: '' })}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t(labelKey)}</span>
                  </label>
                ))}
                {completion.type === 'minimum_grade' && (
                  <div className="pl-7">
                    <Input
                      label={t('courseManagement.minimumGrade')}
                      type="number"
                      value={completion.value}
                      onChange={(e) => setCompletion((prev) => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>{t('common.back')}</Button>
              <Button onClick={handlePublish} isLoading={createCourse.isPending}>
                {publishVisible ? t('courseManagement.publish') : t('courseManagement.saveDraft')}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <StepWizard steps={WIZARD_STEPS} currentStep={step}>
      {renderStepContent()}
    </StepWizard>
  );
}
