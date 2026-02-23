import { NextResponse } from 'next/server';
import { JwtError, RoleError } from '@/lib/auth/jwt-verifier';
import { MoodleClientError } from '@/lib/moodle/client';

/** Security headers applied to every BFF response */
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/** Creates a NextResponse.json with security headers attached */
export function jsonResponse(data: unknown, status = 200): NextResponse {
  const res = NextResponse.json(data, { status });
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

/**
 * Catches known error types and returns an appropriate HTTP error response.
 * - JwtError → 401
 * - RoleError → 403
 * - MoodleClientError → its status
 * - Unknown → 500
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof JwtError) {
    return jsonResponse({ error: 'Unauthorized', message: 'Authentication required' }, 401);
  }
  if (error instanceof RoleError) {
    return jsonResponse({ error: 'Forbidden', message: 'Insufficient permissions' }, 403);
  }
  if (error instanceof MoodleClientError) {
    return jsonResponse({ error: error.error, message: error.userMessage }, error.status);
  }
  return jsonResponse({ error: 'Internal Server Error', message: 'An unexpected error occurred' }, 500);
}
