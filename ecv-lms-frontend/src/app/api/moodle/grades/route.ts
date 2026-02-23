import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId') ??
      String((payload as Record<string, unknown>)['custom:moodle_user_id']);
    const client = createMoodleClient();
    const grades = await client.call(WS.GRADEREPORT_USER_GET_GRADE_ITEMS, {
      courseid: Number(courseId),
      userid: Number(userId),
    });
    return jsonResponse(grades);
  } catch (error) {
    return handleApiError(error);
  }
}
