import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const client = createMoodleClient();
    const cohorts = await client.call(WS.CORE_COHORT_GET_COHORTS, {});
    return jsonResponse(cohorts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const body = await request.json();
    const client = createMoodleClient();
    const result = await client.call(WS.CORE_COHORT_CREATE_COHORTS, { cohorts: [body] });
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const body = await request.json();
    const client = createMoodleClient();

    if (body.action === 'add') {
      const result = await client.call(WS.CORE_COHORT_ADD_COHORT_MEMBERS, { members: body.members });
      return jsonResponse(result);
    }
    if (body.action === 'remove') {
      const result = await client.call(WS.CORE_COHORT_DELETE_COHORT_MEMBERS, { members: body.members });
      return jsonResponse(result);
    }

    return jsonResponse({ error: 'Bad Request', message: 'Invalid action — use "add" or "remove"' }, 400);
  } catch (error) {
    return handleApiError(error);
  }
}
