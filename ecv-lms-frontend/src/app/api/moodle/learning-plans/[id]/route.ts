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
    const plan = await client.call(WS.TOOL_LP_DATA_FOR_PLAN_PAGE, { planid: Number(id) });
    return jsonResponse(plan);
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
    const result = await client.call(WS.CORE_COMPETENCY_GRADE_COMPETENCY_IN_PLAN, {
      planid: Number(id),
      competencyid: body.competencyId,
      grade: body.grade,
      ...(body.note ? { note: body.note } : {}),
    });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
