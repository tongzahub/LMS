'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface CourseAnalyticsChartsProps {
  analytics: CourseAnalytics;
}

export function CourseAnalyticsCharts({ analytics }: CourseAnalyticsChartsProps) {
  const { t } = useI18n();

  const maxEnrollment = Math.max(...analytics.enrollmentTrend.map((d) => d.count), 1);
  const maxGradeCount = Math.max(...analytics.gradeDistribution.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Enrollment Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            {t('analytics.enrollmentTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {analytics.enrollmentTrend.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 min-h-[2px]"
                  style={{ height: `${(point.count / maxEnrollment) * 100}%` }}
                  title={`${point.date}: ${point.count}`}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {point.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="w-4 h-4 text-green-500" />
            {t('analytics.completionRate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none" stroke="#e5e7eb" strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${analytics.completionRate} ${100 - analytics.completionRate}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">
                {Math.round(analytics.completionRate)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            {t('analytics.gradeDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.gradeDistribution.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-12 shrink-0">{bucket.range}</span>
                <ProgressBar
                  value={(bucket.count / maxGradeCount) * 100}
                  showLabel={false}
                  size="sm"
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-6 text-right">{bucket.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
