'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';
import { useGradeCompetency } from '@/hooks/useLearningPlans';

interface CompetencyGradingFormProps {
  planId: number;
  competencyId: number;
  competencyName: string;
  onClose: () => void;
}

const PROFICIENCY_LEVELS = [1, 2, 3, 4, 5] as const;

export function CompetencyGradingForm({
  planId,
  competencyId,
  competencyName,
  onClose,
}: CompetencyGradingFormProps) {
  const { t } = useI18n();
  const gradeMutation = useGradeCompetency();

  const [grade, setGrade] = useState<number>(1);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeMutation.mutate(
      { planId, competencyId, grade, note: note.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal isOpen onClose={onClose} title={t('planAdmin.gradeCompetency')}>
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-gray-600 mb-4">{competencyName}</p>

        <fieldset className="mb-4">
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            {t('planAdmin.proficiencyLevel')}
          </legend>
          <div className="flex gap-3">
            {PROFICIENCY_LEVELS.map((level) => (
              <label
                key={level}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium ${
                  grade === level
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="grade"
                  value={level}
                  checked={grade === level}
                  onChange={() => setGrade(level)}
                  className="sr-only"
                />
                {level}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-4">
          <label htmlFor="grading-note" className="block text-sm font-medium text-gray-700 mb-1">
            {t('planAdmin.note')}
          </label>
          <textarea
            id="grading-note"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={gradeMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={gradeMutation.isPending}>
            {t('common.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
