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
    const students = await client.call(WS.CORE_ENROL_GET_USERS_COURSES, { courseid: Number(id) });
    return jsonResponse(students);
  } catch (error) {
    return handleApiError(error);
  }
}
