import type { NextRequest } from 'next/server';
import { verifyRequest } from '@/lib/auth/jwt-verifier';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    return jsonResponse({
      sub: payload.sub,
      groups: (payload as Record<string, unknown>)['cognito:groups'] ?? [],
      moodleUserId: (payload as Record<string, unknown>)['custom:moodle_user_id'] ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
