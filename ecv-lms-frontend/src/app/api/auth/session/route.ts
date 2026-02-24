import type { NextRequest } from 'next/server';
import { verifyRequest } from '@/lib/auth/jwt-verifier';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    const claims = payload as Record<string, unknown>;
    return jsonResponse({
      sub: payload.sub,
      email: claims['email'] ?? null,
      groups: claims['cognito:groups'] ?? [],
      moodleUserId: claims['custom:moodle_user_id'] ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
