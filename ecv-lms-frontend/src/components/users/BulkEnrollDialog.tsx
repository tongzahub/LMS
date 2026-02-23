'use client';

import { useState, useMemo } from 'react';
import { Search, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { useI18n } from '@/contexts/I18nContext';
import { useBatchEnroll, type BatchEnrollParams } from '@/hooks/useEnrollments';
import { useUsers, type UserListItem } from '@/hooks/useUsers';
import { useCourses, type Course } from '@/hooks/useCourses';

interface BulkEnrollDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type EnrollMode = 'manual' | 'csv';

interface CsvEnrollRow {
  email: string;
  courseId: number;
}

export function BulkEnrollDialog({ isOpen, onClose }: BulkEnrollDialogProps) {
  const { t } = useI18n();
  const batchEnroll = useBatchEnroll();
  const { data: users } = useUsers();
  const { data: courses } = useCourses();

  const [mode, setMode] = useState<EnrollMode>('manual');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [csvRows, setCsvRows] = useState<CsvEnrollRow[]>([]);
  const [csvError, setCsvError] = useState('');
  const [done, setDone] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    const visible = courses.filter((c) => c.visible);
    if (!courseSearch) return visible;
    const q = courseSearch.toLowerCase();
    return visible.filter((c) => c.fullname.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  const toggleUser = (id: number) =>
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleCourse = (id: number) =>
    setSelectedCourseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleCsvUpload = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setCsvError(t('enrollment.csvEmpty'));
        return;
      }

      const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
      const emailIdx = header.indexOf('email');
      const courseIdx = header.indexOf('courseid');

      if (emailIdx === -1 || courseIdx === -1) {
        setCsvError(t('enrollment.csvMissingColumns'));
        return;
      }

      const rows: CsvEnrollRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const email = cols[emailIdx];
        const courseId = parseInt(cols[courseIdx], 10);
        if (email && !isNaN(courseId)) {
          rows.push({ email, courseId });
        }
      }
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleEnroll = async () => {
    if (mode === 'manual') {
      if (selectedUserIds.length === 0 || selectedCourseIds.length === 0) return;
      await batchEnroll.mutateAsync({ userIds: selectedUserIds, courseIds: selectedCourseIds });
    } else {
      // Resolve emails to user IDs
      const emailMap = new Map((users ?? []).map((u) => [u.email.toLowerCase(), u.id]));
      const userIds = new Set<number>();
      const courseIds = new Set<number>();
      for (const row of csvRows) {
        const uid = emailMap.get(row.email.toLowerCase());
        if (uid) {
          userIds.add(uid);
          courseIds.add(row.courseId);
        }
      }
      if (userIds.size === 0 || courseIds.size === 0) return;
      await batchEnroll.mutateAsync({ userIds: Array.from(userIds), courseIds: Array.from(courseIds) });
    }
    setDone(true);
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    setSelectedCourseIds([]);
    setUserSearch('');
    setCourseSearch('');
    setCsvRows([]);
    setCsvError('');
    setDone(false);
    setMode('manual');
    onClose();
  };

  const canSubmit =
    mode === 'manual'
      ? selectedUserIds.length > 0 && selectedCourseIds.length > 0
      : csvRows.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('enrollment.bulkEnroll')} className="max-w-2xl">
      {done ? (
        <div className="text-center py-8 space-y-3">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" aria-hidden="true" />
          <p className="text-lg font-medium text-gray-900">{t('enrollment.success')}</p>
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 border-b pb-3">
            <button
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'manual' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMode('manual')}
            >
              {t('enrollment.manualSelection')}
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'csv' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMode('csv')}
            >
              <Upload className="h-4 w-4 inline mr-1" aria-hidden="true" />
              {t('enrollment.csvUpload')}
            </button>
          </div>

          {mode === 'manual' ? (
            <ManualEnrollSection
              users={filteredUsers}
              courses={filteredCourses}
              selectedUserIds={selectedUserIds}
              selectedCourseIds={selectedCourseIds}
              userSearch={userSearch}
              courseSearch={courseSearch}
              onUserSearch={setUserSearch}
              onCourseSearch={setCourseSearch}
              onToggleUser={toggleUser}
              onToggleCourse={toggleCourse}
              t={t}
            />
          ) : (
            <CsvEnrollSection
              csvRows={csvRows}
              csvError={csvError}
              onUpload={handleCsvUpload}
              t={t}
            />
          )}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEnroll} isLoading={batchEnroll.isPending} disabled={!canSubmit}>
              {t('enrollment.enroll')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}


/* ── Manual Selection Section ── */

interface ManualEnrollSectionProps {
  users: UserListItem[];
  courses: Course[];
  selectedUserIds: number[];
  selectedCourseIds: number[];
  userSearch: string;
  courseSearch: string;
  onUserSearch: (v: string) => void;
  onCourseSearch: (v: string) => void;
  onToggleUser: (id: number) => void;
  onToggleCourse: (id: number) => void;
  t: (key: string) => string;
}

function ManualEnrollSection({
  users,
  courses,
  selectedUserIds,
  selectedCourseIds,
  userSearch,
  courseSearch,
  onUserSearch,
  onCourseSearch,
  onToggleUser,
  onToggleCourse,
  t,
}: ManualEnrollSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* User selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{t('enrollment.selectUsers')}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('common.search') + '...'}
            value={userSearch}
            onChange={(e) => onUserSearch(e.target.value)}
            className="pl-9"
            aria-label={t('enrollment.searchUsers')}
          />
        </div>
        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
          {users.length === 0 && (
            <p className="p-3 text-sm text-gray-500 text-center">{t('common.noResults')}</p>
          )}
          {users.slice(0, 50).map((u) => (
            <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(u.id)}
                onChange={() => onToggleUser(u.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {u.firstname} {u.lastname}
              <span className="text-gray-400 text-xs ml-auto">{u.email}</span>
            </label>
          ))}
        </div>
        {selectedUserIds.length > 0 && (
          <p className="text-xs text-gray-500">{selectedUserIds.length} {t('enrollment.usersSelected')}</p>
        )}
      </div>

      {/* Course selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{t('enrollment.selectCourses')}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('common.search') + '...'}
            value={courseSearch}
            onChange={(e) => onCourseSearch(e.target.value)}
            className="pl-9"
            aria-label={t('enrollment.searchCourses')}
          />
        </div>
        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
          {courses.length === 0 && (
            <p className="p-3 text-sm text-gray-500 text-center">{t('common.noResults')}</p>
          )}
          {courses.slice(0, 50).map((c) => (
            <label key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedCourseIds.includes(c.id)}
                onChange={() => onToggleCourse(c.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              {c.fullname}
              <span className="text-gray-400 text-xs ml-auto">{c.shortname}</span>
            </label>
          ))}
        </div>
        {selectedCourseIds.length > 0 && (
          <p className="text-xs text-gray-500">{selectedCourseIds.length} {t('enrollment.coursesSelected')}</p>
        )}
      </div>
    </div>
  );
}

/* ── CSV Upload Section ── */

interface CsvEnrollSectionProps {
  csvRows: CsvEnrollRow[];
  csvError: string;
  onUpload: (files: File[]) => void;
  t: (key: string) => string;
}

function CsvEnrollSection({ csvRows, csvError, onUpload, t }: CsvEnrollSectionProps) {
  return (
    <div className="space-y-3">
      <FileUpload
        accept=".csv"
        onFilesSelected={onUpload}
        label={t('enrollment.uploadCsv')}
        helperText={t('enrollment.csvHelper')}
        error={csvError}
        maxSizeMB={5}
      />

      {csvRows.length > 0 && (
        <div className="border rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {csvRows.length} {t('enrollment.rowsParsed')}
          </p>
          <div className="max-h-40 overflow-y-auto text-xs">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-1 pr-4">{t('auth.email')}</th>
                  <th className="pb-1">{t('enrollment.courseId')}</th>
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-4">{row.email}</td>
                    <td className="py-1">{row.courseId}</td>
                  </tr>
                ))}
                {csvRows.length > 20 && (
                  <tr>
                    <td colSpan={2} className="py-1 text-gray-400">
                      ...{csvRows.length - 20} {t('enrollment.moreRows')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
