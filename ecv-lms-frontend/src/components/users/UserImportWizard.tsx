'use client';

import { useState, useCallback } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { StepWizard } from '@/components/ui/StepWizard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/contexts/I18nContext';
import { useBulkImportUsers, type ImportResult } from '@/hooks/useUsers';
import {
  validateUserImportCsv,
  generateImportTemplate,
  type CsvValidationResult,
  type CsvValidationError,
  type UserImportRow,
} from '@/lib/csv/processor';

const WIZARD_STEPS = [
  { label: 'Upload' },
  { label: 'Preview' },
  { label: 'Result' },
];

export function UserImportWizard({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const bulkImport = useBulkImportUsers();

  const [step, setStep] = useState(0);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setFileError(t('csv.invalidFileFormat'));
      return;
    }

    setFileError(null);
    try {
      const result = await validateUserImportCsv(file);
      setValidationResult(result);
      setStep(1);
    } catch {
      setFileError(t('csv.parseError'));
    }
  }, [t]);

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateImportTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!validationResult) return;
    try {
      const result = await bulkImport.mutateAsync(
        validationResult.validRows.map((row) => ({
          username: row.email,
          email: row.email,
          firstname: row.firstname,
          lastname: row.lastname,
          password: row.password,
          auth: 'manual',
        })),
      );
      setImportResult(result);
      setStep(2);
    } catch {
      setImportResult({
        successCount: 0,
        failureCount: validationResult.validRows.length,
        failures: [{ row: 0, email: '', reason: t('common.error') }],
      });
      setStep(2);
    }
  }, [validationResult, bulkImport, t]);

  const handleReset = useCallback(() => {
    setStep(0);
    setValidationResult(null);
    setImportResult(null);
    setFileError(null);
  }, []);

  return (
    <div className="space-y-6">
      <StepWizard steps={WIZARD_STEPS} currentStep={step}>
        {step === 0 && (
          <UploadStep
            onFileSelected={handleFileSelected}
            onDownloadTemplate={handleDownloadTemplate}
            fileError={fileError}
            t={t}
          />
        )}
        {step === 1 && validationResult && (
          <PreviewStep
            result={validationResult}
            onConfirm={handleConfirmImport}
            onBack={handleReset}
            isLoading={bulkImport.isPending}
            t={t}
          />
        )}
        {step === 2 && importResult && (
          <ResultStep
            result={importResult}
            onDone={onClose}
            onImportMore={handleReset}
            t={t}
          />
        )}
      </StepWizard>
    </div>
  );
}

function UploadStep({
  onFileSelected,
  onDownloadTemplate,
  fileError,
  t,
}: {
  onFileSelected: (files: File[]) => void;
  onDownloadTemplate: () => void;
  fileError: string | null;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      <FileUpload
        accept=".csv"
        onFilesSelected={onFileSelected}
        label={t('csv.uploadLabel')}
        helperText={t('csv.uploadHelper')}
        error={fileError ?? undefined}
        maxSizeMB={5}
      />
      <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
        <Download className="h-4 w-4 mr-1" aria-hidden="true" />
        {t('csv.downloadTemplate')}
      </Button>
    </div>
  );
}

function PreviewStep({
  result,
  onConfirm,
  onBack,
  isLoading,
  t,
}: {
  result: CsvValidationResult;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4">
        <Card padding="sm" className="flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            <span className="text-sm font-medium">{result.validCount} {t('csv.validRows')}</span>
          </div>
        </Card>
        <Card padding="sm" className="flex-1">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            <span className="text-sm font-medium">{result.errorCount} {t('csv.invalidRows')}</span>
          </div>
        </Card>
      </div>

      {/* Valid rows preview */}
      {result.validRows.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('csv.previewValid')}</h4>
          <div className="overflow-x-auto border rounded-lg max-h-48 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">{t('auth.email')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">{t('auth.firstName')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">{t('auth.lastName')}</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">{t('users.role')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.validRows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5">{row.email}</td>
                    <td className="px-3 py-1.5">{row.firstname}</td>
                    <td className="px-3 py-1.5">{row.lastname}</td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status="active" label={row.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.validRows.length > 10 && (
              <p className="text-xs text-gray-500 px-3 py-2">
                ...and {result.validRows.length - 10} more rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error report */}
      {result.errors.length > 0 && (
        <ErrorReport errors={result.errors} t={t} />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>{t('common.back')}</Button>
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={result.validCount === 0}
        >
          <Upload className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('csv.confirmImport')} ({result.validCount})
        </Button>
      </div>
    </div>
  );
}

function ErrorReport({
  errors,
  t,
}: {
  errors: CsvValidationError[];
  t: (key: string) => string;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {t('csv.errorReport')}
      </h4>
      <div className="overflow-x-auto border border-red-200 rounded-lg max-h-40 overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.row')}</th>
              <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.column')}</th>
              <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.value')}</th>
              <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.errorMessage')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {errors.map((err, i) => (
              <tr key={i}>
                <td className="px-3 py-1.5">{err.row}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{err.column}</td>
                <td className="px-3 py-1.5 text-gray-500">{err.value || '—'}</td>
                <td className="px-3 py-1.5 text-red-600">{err.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultStep({
  result,
  onDone,
  onImportMore,
  t,
}: {
  result: ImportResult;
  onDone: () => void;
  onImportMore: () => void;
  t: (key: string) => string;
}) {
  const allSuccess = result.failureCount === 0;

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        {allSuccess ? (
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-2" aria-hidden="true" />
        )}
        <h3 className="text-lg font-semibold">
          {allSuccess ? t('csv.importComplete') : t('csv.importPartial')}
        </h3>
      </div>

      <div className="flex gap-4 justify-center">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
            <p className="text-xs text-gray-500">{t('csv.usersCreated')}</p>
          </div>
        </Card>
        {result.failureCount > 0 && (
          <Card padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{result.failureCount}</p>
              <p className="text-xs text-gray-500">{t('csv.usersFailed')}</p>
            </div>
          </Card>
        )}
      </div>

      {result.failures.length > 0 && (
        <div className="overflow-x-auto border border-red-200 rounded-lg max-h-40 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-red-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.row')}</th>
                <th className="px-3 py-2 text-left font-medium text-red-700">{t('auth.email')}</th>
                <th className="px-3 py-2 text-left font-medium text-red-700">{t('csv.reason')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100">
              {result.failures.map((f, i) => (
                <tr key={i}>
                  <td className="px-3 py-1.5">{f.row}</td>
                  <td className="px-3 py-1.5">{f.email}</td>
                  <td className="px-3 py-1.5 text-red-600">{f.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onImportMore}>{t('csv.importMore')}</Button>
        <Button onClick={onDone}>{t('common.close')}</Button>
      </div>
    </div>
  );
}
