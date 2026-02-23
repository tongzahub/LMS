'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';
import { Download, FileText, Users, BookOpen, TrendingUp, Activity } from 'lucide-react';

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const registrationData = [
  { month: 'Jan', count: 45 },
  { month: 'Feb', count: 62 },
  { month: 'Mar', count: 78 },
  { month: 'Apr', count: 51 },
  { month: 'May', count: 95 },
  { month: 'Jun', count: 110 },
];

const activeUsersData = [
  { day: 'Mon', count: 320 },
  { day: 'Tue', count: 410 },
  { day: 'Wed', count: 390 },
  { day: 'Thu', count: 450 },
  { day: 'Fri', count: 380 },
  { day: 'Sat', count: 210 },
  { day: 'Sun', count: 180 },
];

const completionData = [
  { course: 'Introduction to AI', rate: 87 },
  { course: 'Web Development', rate: 72 },
  { course: 'Data Science', rate: 65 },
  { course: 'Cloud Computing', rate: 91 },
  { course: 'Cybersecurity', rate: 58 },
];

const enrollmentData = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 145 },
  { month: 'Mar', count: 198 },
  { month: 'Apr', count: 167 },
  { month: 'May', count: 230 },
  { month: 'Jun', count: 275 },
];


function BarChart({ data, labelKey, valueKey, maxValue }: { data: Record<string, unknown>[]; labelKey: string; valueKey: string; maxValue: number }) {
  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="w-full flex flex-col justify-end h-40">
            <div
              className="bg-blue-500 rounded-t w-full min-h-[4px]"
              style={{ height: `${((item[valueKey] as number) / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 mt-1">{item[labelKey] as string}</span>
          <span className="text-xs font-medium">{item[valueKey] as number}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useI18n();

  const regMax = Math.max(...registrationData.map(d => d.count));
  const activeMax = Math.max(...activeUsersData.map(d => d.count));
  const enrollMax = Math.max(...enrollmentData.map(d => d.count));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>{t('reports.registrationTrends')}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      'registration-trends.csv',
                      [t('reports.month'), t('reports.count')],
                      registrationData.map(d => [d.month, String(d.count)])
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('reports.exportCsv')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('reports.exportPdf')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart data={registrationData} labelKey="month" valueKey="count" maxValue={regMax} />
          </CardContent>
        </Card>

        {/* Active User Counts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <CardTitle>{t('reports.activeUsers')}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      'active-users.csv',
                      [t('reports.day'), t('reports.count')],
                      activeUsersData.map(d => [d.day, String(d.count)])
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('reports.exportCsv')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('reports.exportPdf')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart data={activeUsersData} labelKey="day" valueKey="count" maxValue={activeMax} />
          </CardContent>
        </Card>

        {/* Course Completion Rates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <CardTitle>{t('reports.completionRates')}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      'completion-rates.csv',
                      [t('reports.course'), t('reports.rate')],
                      completionData.map(d => [d.course, `${d.rate}%`])
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('reports.exportCsv')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('reports.exportPdf')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completionData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.course}</span>
                    <span className="font-medium">{item.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <CardTitle>{t('reports.enrollmentTrends')}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      'enrollment-trends.csv',
                      [t('reports.month'), t('reports.count')],
                      enrollmentData.map(d => [d.month, String(d.count)])
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('reports.exportCsv')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="h-4 w-4 mr-1" />
                  {t('reports.exportPdf')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart data={enrollmentData} labelKey="month" valueKey="count" maxValue={enrollMax} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
