'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Activity,
  BookOpen,
  UserCheck,
  Clock,
  TrendingUp,
  PieChart,
  Server,
  Database,
  HardDrive,
  Zap,
  Plus,
  UserPlus,
  BarChart3,
  Settings,
  Trophy,
  Medal,
  Star,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Placeholder data — will be replaced by real admin stats API
// ---------------------------------------------------------------------------

const STATS = {
  totalUsers: 1247,
  activeToday: 312,
  totalCourses: 48,
  activeEnrollments: 3891,
  pendingApprovals: 7,
  newThisWeek: 43,
  completionRate: 71,
  avgGrade: 82,
};

const REGISTRATION_TREND = [
  { month: '2025-08', label: 'Aug', count: 85, color: 'from-brand-400 to-brand-500' },
  { month: '2025-09', label: 'Sep', count: 112, color: 'from-brand-400 to-brand-500' },
  { month: '2025-10', label: 'Oct', count: 98, color: 'from-brand-400 to-brand-500' },
  { month: '2025-11', label: 'Nov', count: 145, color: 'from-brand-400 to-brand-500' },
  { month: '2025-12', label: 'Dec', count: 167, color: 'from-brand-400 to-brand-500' },
  { month: '2026-01', label: 'Jan', count: 134, color: 'from-brand-400 to-brand-500' },
  { month: '2026-02', label: 'Feb', count: 189, color: 'from-indigo-400 to-indigo-600' },
];

const ROLE_DISTRIBUTION = [
  { role: 'Administrator', count: 12, total: 1247, color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
  { role: 'Teacher', count: 85, total: 1247, color: 'bg-brand-500', lightColor: 'bg-brand-100', textColor: 'text-brand-700' },
  { role: 'Student', count: 1150, total: 1247, color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-700' },
];

const RECENT_ACTIVITY = [
  { id: 1, user: 'Somchai P.', initials: 'SP', action: 'Enrolled in Advanced Mathematics', time: '5 min ago', color: 'bg-brand-500' },
  { id: 2, user: 'Nattaya K.', initials: 'NK', action: 'Completed Introduction to Physics', time: '12 min ago', color: 'bg-green-500' },
  { id: 3, user: 'Prasit W.', initials: 'PW', action: 'Submitted assignment in Thai Literature', time: '25 min ago', color: 'bg-purple-500' },
  { id: 4, user: 'Kanya S.', initials: 'KS', action: 'Created new course: Data Science 101', time: '1 hr ago', color: 'bg-amber-500' },
  { id: 5, user: 'Anong T.', initials: 'AT', action: 'Updated profile and reset password', time: '2 hr ago', color: 'bg-pink-500' },
  { id: 6, user: 'Wanchai B.', initials: 'WB', action: 'Approved 3 pending registrations', time: '3 hr ago', color: 'bg-teal-500' },
  { id: 7, user: 'Siriporn M.', initials: 'SM', action: 'Started learning plan: IT Professional Path', time: '4 hr ago', color: 'bg-indigo-500' },
  { id: 8, user: 'Thitipong R.', initials: 'TR', action: 'Earned certification: Web Developer Level 2', time: '5 hr ago', color: 'bg-rose-500' },
];

const SYSTEM_HEALTH = [
  { label: 'Moodle Version', value: '4.3.2', status: 'ok', icon: Server },
  { label: 'PHP Version', value: '8.2.14', status: 'ok', icon: Zap },
  { label: 'Database', value: 'MySQL 8.0 · Online', status: 'ok', icon: Database },
  { label: 'Cache', value: 'Redis · Active', status: 'ok', icon: Activity },
  { label: 'Disk Usage', value: '68% (34 GB / 50 GB)', status: 'warning', icon: HardDrive },
];

const POPULAR_COURSES = [
  { rank: 1, name: 'Introduction to Web Development', enrolled: 342, completion: 78, category: 'IT' },
  { rank: 2, name: 'Business English for Professionals', enrolled: 289, completion: 85, category: 'Language' },
  { rank: 3, name: 'Data Science with Python', enrolled: 256, completion: 62, category: 'IT' },
  { rank: 4, name: 'Project Management Professional', enrolled: 198, completion: 71, category: 'Business' },
  { rank: 5, name: 'Digital Marketing Fundamentals', enrolled: 175, completion: 90, category: 'Business' },
];

const QUICK_ACTIONS = [
  { label: 'Create Course', icon: Plus, href: '/admin/courses/create', color: 'bg-brand-600 hover:bg-brand-700 text-white' },
  { label: 'Add User', icon: UserPlus, href: '/admin/users', color: 'bg-green-600 hover:bg-green-700 text-white' },
  { label: 'View Reports', icon: BarChart3, href: '/admin/reports', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings', color: 'bg-gray-700 hover:bg-gray-800 text-white' },
];

const RANK_ICONS = [Trophy, Medal, Star];

export function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const maxRegistration = Math.max(...REGISTRATION_TREND.map((d) => d.count), 1);
  const maxRole = Math.max(...ROLE_DISTRIBUTION.map((d) => d.count), 1);

  const statCards = [
    {
      label: t('adminDashboard.totalUsers'),
      value: STATS.totalUsers.toLocaleString(),
      sub: `+${STATS.newThisWeek} this week`,
      icon: Users,
      gradient: 'from-brand-500 to-brand-700',
      bg: 'from-brand-50 to-brand-100/60',
      iconBg: 'bg-brand-600',
    },
    {
      label: t('adminDashboard.activeToday'),
      value: STATS.activeToday.toLocaleString(),
      sub: `${Math.round((STATS.activeToday / STATS.totalUsers) * 100)}% of users`,
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'from-green-50 to-emerald-100/60',
      iconBg: 'bg-green-600',
    },
    {
      label: t('adminDashboard.totalCourses'),
      value: STATS.totalCourses.toLocaleString(),
      sub: 'Across 6 categories',
      icon: BookOpen,
      gradient: 'from-purple-500 to-violet-600',
      bg: 'from-purple-50 to-violet-100/60',
      iconBg: 'bg-purple-600',
    },
    {
      label: t('adminDashboard.activeEnrollments'),
      value: STATS.activeEnrollments.toLocaleString(),
      sub: `${STATS.completionRate}% completion rate`,
      icon: UserCheck,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-100/60',
      iconBg: 'bg-amber-600',
    },
    {
      label: t('adminDashboard.pendingApprovals'),
      value: STATS.pendingApprovals.toLocaleString(),
      sub: 'Requires action',
      icon: Clock,
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-100/60',
      iconBg: 'bg-red-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('dashboard.welcome', { name: user?.givenName ?? '' })}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                size="sm"
                className={`${action.color} border-0 shadow-sm`}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br ${stat.bg} p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shadow-sm`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{stat.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5 pr-10">{stat.label}</p>
            <p className="text-[11px] text-gray-400 mt-1 pr-10">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              {t('adminDashboard.registrationTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-44">
              {REGISTRATION_TREND.map((point, idx) => {
                const heightPct = (point.count / maxRegistration) * 100;
                const isLatest = idx === REGISTRATION_TREND.length - 1;
                return (
                  <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[11px] font-semibold tabular-nums ${isLatest ? 'text-brand-600' : 'text-gray-500'}`}>
                      {point.count}
                    </span>
                    <div className="relative w-full" style={{ height: `${(heightPct / 100) * 140}px` }}>
                      <div
                        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${point.color} rounded-t-md transition-all duration-700 min-h-[4px] ${isLatest ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
                        style={{ height: '100%' }}
                        title={`${point.month}: ${point.count} registrations`}
                      />
                    </div>
                    <span className={`text-[10px] font-medium truncate w-full text-center ${isLatest ? 'text-brand-600' : 'text-gray-400'}`}>
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Monthly new user registrations</p>
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
            <div className="space-y-5">
              {ROLE_DISTRIBUTION.map((item) => {
                const pct = Math.round((item.count / item.total) * 100);
                return (
                  <div key={item.role}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                        <span className="text-sm font-medium text-gray-700">{item.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.lightColor} ${item.textColor}`}>
                          {pct}%
                        </span>
                        <span className="text-sm text-gray-500 tabular-nums w-12 text-right">{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${(item.count / maxRole) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>Total users: {STATS.totalUsers.toLocaleString()}</span>
              <span>Avg. grade: {STATS.avgGrade}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health + Popular Courses row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="w-4 h-4 text-teal-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SYSTEM_HEALTH.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.status === 'ok' ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <item.icon className={`w-4 h-4 ${item.status === 'ok' ? 'text-green-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                  </div>
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${item.status === 'ok' ? 'bg-green-500' : 'bg-amber-500'}`} title={item.status === 'ok' ? 'Healthy' : 'Warning'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Courses leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-amber-500" />
              Popular Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {POPULAR_COURSES.map((course) => {
                const RankIcon = RANK_ICONS[course.rank - 1];
                const rankColor = course.rank === 1 ? 'text-amber-500' : course.rank === 2 ? 'text-gray-400' : course.rank === 3 ? 'text-amber-700' : 'text-gray-300';
                return (
                  <li key={course.rank} className="flex items-center gap-3 group">
                    <div className="w-6 shrink-0 flex justify-center">
                      {RankIcon ? (
                        <RankIcon className={`w-4 h-4 ${rankColor}`} />
                      ) : (
                        <span className="text-xs font-bold text-gray-400 tabular-nums">#{course.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-brand-600 transition-colors">{course.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                            style={{ width: `${course.completion}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 tabular-nums shrink-0">{course.completion}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{course.enrolled}</span>
                      <p className="text-[10px] text-gray-400">enrolled</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-green-500" />
              {t('adminDashboard.recentActivity')}
            </CardTitle>
            <Link href="/admin/audit-log" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
              View all activity
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm group">
                {/* Avatar circle with initials */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}
                >
                  <span className="text-[11px] font-bold text-white">{item.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">{item.user}</span>{' '}
                    {item.action}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 tabular-nums">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
