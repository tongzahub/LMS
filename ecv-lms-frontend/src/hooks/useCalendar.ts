import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetch';
import { isDemoMode } from '@/lib/demo';
import { MOCK_CALENDAR_EVENTS } from '@/lib/mock';

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

  const demoQuery = useQuery<CalendarEvent[]>({
    queryKey: ['calendarEvents', 'demo', options],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let result = MOCK_CALENDAR_EVENTS;
      if (options?.courseId) {
        result = result.filter((e) => e.courseId === options.courseId);
      }
      if (options?.from) {
        const from = new Date(options.from).getTime();
        result = result.filter((e) => new Date(e.timeStart).getTime() >= from);
      }
      if (options?.to) {
        const to = new Date(options.to).getTime();
        result = result.filter((e) => new Date(e.timeStart).getTime() <= to);
      }
      return result;
    },
    enabled: isDemoMode,
    staleTime: Infinity,
  });

  const apiQuery = useQuery<CalendarEvent[]>({
    queryKey: ['calendarEvents', options],
    queryFn: () => apiFetch<CalendarEvent[]>(`/api/moodle/calendar${qs ? `?${qs}` : ''}`),
    enabled: !isDemoMode,
  });

  return isDemoMode ? demoQuery : apiQuery;
}
