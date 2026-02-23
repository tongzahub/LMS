'use client';

import { usePlanDetail } from '@/hooks/useLearningPlans';
import type { LearningPlan, PlanCompetency } from '@/hooks/useLearningPlans';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge, type BadgeStatus } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { CompetencyProgressBar } from '@/components/learning-plans/CompetencyProgressBar';
import { Target, BookOpen, Calendar, TrendingUp } from 'lucide-react';

const statusMap: Record<LearningPlan['status'], BadgeStatus> = {
  draft: 'draft',
  waiting_for_review: 'warning',
  in_review: 'warning',
  active: 'active',
  complete: 'success',
};

function getRecommendedCourses(competencies: PlanCompetency[]) {
  const seen = new Set<number>();
  const courses: { courseId: number; courseName: string; progress: number }[] = [];

  for (const comp of competencies) {
    const currentOrder = comp.currentProficiency?.sortOrder ?? 0;
    if (currentOrder >= comp.requiredProficiency.sortOrder) continue;
    for (const course of comp.linkedCourses) {
      if (!seen.has(course.courseId)) {
        seen.add(course.courseId);
        courses.push(course);
      }
    }
  }
  return courses;
}


interface PlanDetailViewProps {
  planId: number;
}

export function PlanDetailView({ planId }: PlanDetailViewProps) {
  const { t, formatDate } = useI18n();
  const { data: plan, isLoading } = usePlanDetail(planId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="2rem" width="14rem" />
        <Skeleton variant="rectangular" height="12rem" />
        <Skeleton variant="rectangular" height="16rem" />
      </div>
    );
  }

  if (!plan) return null;

  const recommended = getRecommendedCourses(plan.competencies);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{plan.name}</CardTitle>
            <StatusBadge status={statusMap[plan.status]} label={plan.status.replace(/_/g, ' ')} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.dueDate && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{formatDate(new Date(plan.dueDate))}</span>
            </div>
          )}
          <ProgressBar value={plan.overallProgress} />
        </CardContent>
      </Card>

      {/* Competencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" aria-hidden="true" />
            {t('planViews.competencies')}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {plan.competencies.map((comp) => (
            <div key={comp.competencyId} className="py-4 first:pt-0 last:pb-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">{comp.competencyName}</h3>
              </div>

              <CompetencyProgressBar
                currentLevel={comp.currentProficiency}
                requiredLevel={comp.requiredProficiency}
              />

              <div className="flex gap-4 text-xs text-gray-500">
                <span>
                  {t('planViews.currentLevel')}: {comp.currentProficiency?.name ?? t('planViews.notAssessed')}
                </span>
                <span>
                  {t('planViews.requiredLevel')}: {comp.requiredProficiency.name}
                </span>
              </div>

              {comp.linkedCourses.length > 0 && (
                <div className="pl-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600">{t('planViews.linkedCourses')}</p>
                  {comp.linkedCourses.map((course) => (
                    <div key={course.courseId} className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-700 flex-1">{course.courseName}</span>
                      <ProgressBar value={course.progress} size="sm" className="w-24" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      {recommended.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" aria-hidden="true" />
              {t('planViews.recommendedCourses')}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{t('planViews.recommendedDesc')}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommended.map((course) => (
              <div key={course.courseId} className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-700 flex-1">{course.courseName}</span>
                <ProgressBar value={course.progress} size="sm" className="w-28" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
