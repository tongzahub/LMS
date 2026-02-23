import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';

export interface CalendarEvent {
  id: number;
  name: string;
  description: string;
  courseId?: number;
  courseName?: string;
  eventType: 'assignment' | 'quiz' | 'event' | 'deadline';
  timeStart: string;
  timeEnd?: string;
}

export interface CalendarOptions {
  courseId?: number;
  from?: string;
  to?: string;
}

export function useCalendarEvents(options?: CalendarOptions) {
  const params = new URLSearchParams();
  if (options?.courseId) params.set('courseId', String(options.courseId));
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  const qs = params.toString();

  return useQuery<CalendarEvent[]>({
    queryKey: ['calendarEvents', options],
    queryFn: () => apiFetch<CalendarEvent[]>(`/api/moodle/calendar${qs ? `?${qs}` : ''}`),
  });
}
