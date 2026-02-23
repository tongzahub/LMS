'use client';

import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Users,
  Activity,
  BookOpen,
  UserCheck,
  Clock,
  TrendingUp,
  PieChart,
} from 'lucide-react';

// Placeholder data — will be replaced by real admin stats API
const STATS = {
  totalUsers: 1247,
  activeToday: 312,
  totalCourses: 48,
  activeEnrollments: 3891,
  pendingApprovals: 7,
};

const REGISTRATION_TREND = [
  { month: '2025-01', count: 85 },
  { month: '2025-02', count: 112 },
  { month: '2025-03', count: 98 },
  { month: '2025-04', count: 145 },
  { month: '2025-05', count: 167 },
  { month: '2025-06', count: 134 },
];

const ROLE_DISTRIBUTION = [
  { role: 'Admin', count: 12, color: 'bg-purple-500' },
  { role: 'Teacher', count: 85, color: 'bg-blue-500' },
  { role: 'Student', count: 1150, color: 'bg-green-500' },
];

const RECENT_ACTIVITY = [
  { id: 1, user: 'Somchai P.', action: 'Enrolled in Advanced Mathematics', time: '5 min ago' },
  { id: 2, user: 'Nattaya K.', action: 'Completed Introduction to Physics', time: '12 min ago' },
  { id: 3, user: 'Prasit W.', action: 'Submitted assignment in Thai Literature', time: '25 min ago' },
  { id: 4, user: 'Kanya S.', action: 'Created new course: Data Science 101', time: '1 hour ago' },
  { id: 5, user: 'Anong T.', action: 'Updated profile settings', time: '2 hours ago' },
];

export function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const maxRegistration = Math.max(...REGISTRATION_TREND.map((d) => d.count), 1);
  const maxRole = Math.max(...ROLE_DISTRIBUTION.map((d) => d.count), 1);

  const statCards = [
    { label: t('adminDashboard.totalUsers'), value: STATS.totalUsers, icon: Users, color: 'text-blue-500' },
    { label: t('adminDashboard.activeToday'), value: STATS.activeToday, icon: Activity, color: 'text-green-500' },
    { label: t('adminDashboard.totalCourses'), value: STATS.totalCourses, icon: BookOpen, color: 'text-purple-500' },
    { label: t('adminDashboard.activeEnrollments'), value: STATS.activeEnrollments, icon: UserCheck, color: 'text-orange-500' },
    { label: t('adminDashboard.pendingApprovals'), value: STATS.pendingApprovals, icon: Clock, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">
        {t('dashboard.welcome', { name: user?.givenName ?? '' })}
      </h1>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {t('adminDashboard.registrationTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {REGISTRATION_TREND.map((point) => (
                <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{point.count}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 min-h-[2px]"
                    style={{ height: `${(point.count / maxRegistration) * 100}%` }}
                    title={`${point.month}: ${point.count}`}
                  />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">
                    {point.month.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-4 h-4 text-purple-500" />
              {t('adminDashboard.roleDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROLE_DISTRIBUTION.map((item) => (
                <div key={item.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.role}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${(item.count / maxRole) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-green-500" />
            {t('adminDashboard.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">
                    <span className="font-medium">{item.user}</span>{' '}
                    {item.action}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
