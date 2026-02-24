import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { isDemoMode } from '@/lib/demo';

/**
 * Wraps useQuery to return mock data in demo mode.
 * When demo mode is on, returns mock data immediately without any network calls.
 * Uses the `enabled` flag pattern to avoid conditional hook calls.
 */
export function useDemoQuery<T>(
  options: UseQueryOptions<T>,
  mockData: T | (() => T),
): UseQueryResult<T> {
  const demoResult = useQuery<T>({
    ...options,
    queryKey: [...(Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey]), 'demo'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return typeof mockData === 'function' ? (mockData as () => T)() : mockData;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isDemoMode,
  });

  const apiResult = useQuery<T>({
    ...options,
    enabled: !isDemoMode && (options.enabled !== false),
  });

  return isDemoMode ? demoResult : apiResult;
}
