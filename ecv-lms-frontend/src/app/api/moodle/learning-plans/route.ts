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
    const userId = searchParams.get('userId') ??
      String((payload as Record<string, unknown>)['custom:moodle_user_id']);
    const client = createMoodleClient();
    const plans = await client.call(WS.TOOL_LP_DATA_FOR_PLANS_PAGE, { userid: Number(userId) });
    return jsonResponse(plans);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER']);
    const body = await request.json();
    const client = createMoodleClient();

    if (body.action === 'approve') {
      const result = await client.call(WS.CORE_COMPETENCY_APPROVE_PLAN, { id: body.planId });
      return jsonResponse(result);
    }

    const result = await client.call(WS.CORE_COMPETENCY_CREATE_PLAN, body);
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
