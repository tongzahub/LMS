'use client';

import { useRole } from '@/hooks/useRole';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';

export default function DashboardPage() {
  const { isStudent, isTeacher, isAdmin } = useRole();

  // TODO: Wire AdminDashboard in task 13.1
  if (isAdmin) {
    return <div>Admin dashboard coming soon</div>;
  }

  if (isTeacher) {
    return <TeacherDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return null;
}
