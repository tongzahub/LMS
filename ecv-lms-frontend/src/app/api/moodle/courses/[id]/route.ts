import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { id } = await params;
    const client = createMoodleClient();
    const courses = await client.call(WS.CORE_COURSE_GET_COURSES_BY_FIELD, {
      field: 'id',
      value: id,
    });
    return jsonResponse(courses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER']);
    const { id } = await params;
    const body = await request.json();
    const client = createMoodleClient();
    const result = await client.call(WS.CORE_COURSE_UPDATE_COURSES, {
      courses: [{ id: Number(id), ...body }],
    });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
