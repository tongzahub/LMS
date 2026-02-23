import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface Notification {
  id: number;
  subject: string;
  message: string;
  type: 'assignment' | 'grade' | 'message' | 'system';
  read: boolean;
  createdAt: string;
  courseId?: number;
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<Notification[]>('/api/moodle/notifications'),
  });
}
