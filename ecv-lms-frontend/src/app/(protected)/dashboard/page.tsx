'use client';

import { useRole } from '@/hooks/useRole';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { isStudent, isTeacher, isAdmin } = useRole();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isTeacher) {
    return <TeacherDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return null;
}
