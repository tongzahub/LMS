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
    const client = createMoodleClient();
    const events = await client.call(WS.CORE_CALENDAR_GET_CALENDAR_EVENTS, {
      events: {
        courseids: searchParams.get('courseId') ? [Number(searchParams.get('courseId'))] : [],
      },
      options: {
        timestart: searchParams.get('from') ? Number(searchParams.get('from')) : undefined,
        timeend: searchParams.get('to') ? Number(searchParams.get('to')) : undefined,
      },
    });
    return jsonResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}
