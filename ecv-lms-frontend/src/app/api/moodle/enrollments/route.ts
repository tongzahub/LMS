import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER', 'STUDENT']);
    const body = await request.json();
    const client = createMoodleClient();
    const result = await client.call(WS.ENROL_SELF_ENROL_USER, {
      courseid: body.courseId,
      ...(body.password ? { password: body.password } : {}),
    });
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER']);
    const body = await request.json();
    const client = createMoodleClient();
    const result = await client.call(WS.ENROL_MANUAL_ENROL_USERS, {
      enrolments: [{
        roleid: body.roleId ?? 5,
        userid: body.userId,
        courseid: body.courseId,
        suspend: 1,
      }],
    });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
