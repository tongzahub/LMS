import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN', 'TEACHER', 'STUDENT']);
    const client = createMoodleClient();
    const templates = await client.call(WS.CORE_COMPETENCY_LIST_TEMPLATES, {
      sort: 'shortname',
      order: 'ASC',
      skip: 0,
      limit: 0,
      context: { contextid: 1 },
      includes: 'self',
    });
    return jsonResponse(templates);
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

    if (body.action === 'assign') {
      const result = await client.call(WS.CORE_COMPETENCY_CREATE_PLAN_FROM_TEMPLATE, {
        templateid: body.templateId,
        userid: body.userId,
      });
      return jsonResponse(result, 201);
    }

    const result = await client.call(WS.CORE_COMPETENCY_CREATE_TEMPLATE, body);
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
