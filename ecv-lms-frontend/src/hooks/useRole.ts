'use client';

import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/auth/types';

export function useRole() {
  const { role } = useAuth();

  return {
    role,
    isAdmin: role === 'ADMIN',
    isTeacher: role === 'TEACHER',
    isStudent: role === 'STUDENT',
    hasRole: (r: UserRole) => role === r,
  };
}
