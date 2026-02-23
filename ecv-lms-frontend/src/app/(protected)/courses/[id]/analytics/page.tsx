'use client';

import { useParams } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useCourseAnalytics } from '@/hooks/useCourseAnalytics';
import { CourseAnalyticsCharts } from '@/components/courses/CourseAnalyticsCharts';
import { StudentProgressTable } from '@/components/courses/StudentProgressTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Download, FileText, Users } from 'lucide-react';

function exportCsv(students: { userId: number; userName: string; progress: number; grade: number | null; lastAccess: string | null; atRisk: boolean }[]) {
  const header = 'User ID,Name,Progress,Grade,Last Access,At Risk';
  const rows = students.map((s) =>
    [s.userId, `"${s.userName}"`, s.progress, s.grade ?? '', s.lastAccess ?? '', s.atRisk].join(',')
  );
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student-progress.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const id = Number(params.id);
  const { t } = useI18n();
  const { data: analytics, isLoading } = useCourseAnalytics(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="240px" height="32px" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height="200px" />
          ))}
        </div>
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-400">{t('analytics.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            {t('analytics.exportPdf')}
          </button>
          <button
            onClick={() => exportCsv(analytics.studentProgress)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            {t('analytics.exportCsv')}
          </button>
        </div>
      </div>

      <CourseAnalyticsCharts analytics={analytics} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('analytics.studentProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentProgressTable students={analytics.studentProgress} />
        </CardContent>
      </Card>
    </div>
  );
}
