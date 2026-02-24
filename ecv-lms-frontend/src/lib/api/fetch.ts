import { getIdToken } from '@/lib/auth/session';

/**
 * Authenticated fetch wrapper for BFF API routes.
 * Sends the Cognito ID token as Bearer JWT. The ID token contains
 * user attributes (custom:moodle_user_id) and cognito:groups, which
 * BFF routes need to proxy requests to Moodle.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Request failed', body.error);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
