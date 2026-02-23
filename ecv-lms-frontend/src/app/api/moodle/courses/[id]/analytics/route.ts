import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER']);
    const { id } = await params;
    const client = createMoodleClient();
    const [completion, grades] = await Promise.all([
      client.call(WS.CORE_COMPLETION_GET_ACTIVITIES_COMPLETION_STATUS, { courseid: Number(id), userid: 0 }),
      client.call(WS.GRADEREPORT_USER_GET_GRADES_TABLE, { courseid: Number(id) }),
    ]);
    return jsonResponse({ completion, grades });
  } catch (error) {
    return handleApiError(error);
  }
}
