import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole, extractMoodleUserId } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId') ?? String(extractMoodleUserId(payload));
    const client = createMoodleClient();
    const status = await client.call(WS.CORE_COMPLETION_GET_ACTIVITIES_COMPLETION_STATUS, {
      courseid: Number(courseId),
      userid: Number(userId),
    });
    return jsonResponse(status);
  } catch (error) {
    return handleApiError(error);
  }
}
