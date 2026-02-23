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
    const frameworkId = searchParams.get('frameworkId');
    const client = createMoodleClient();

    if (frameworkId) {
      const competencies = await client.call(WS.CORE_COMPETENCY_LIST_COMPETENCIES, {
        filters: { competencyframeworkid: Number(frameworkId) },
      });
      return jsonResponse(competencies);
    }

    const frameworks = await client.call(WS.CORE_COMPETENCY_LIST_COMPETENCY_FRAMEWORKS, {
      sort: 'shortname',
      order: 'ASC',
      skip: 0,
      limit: 0,
      context: { contextid: 1 },
      includes: 'self',
    });
    return jsonResponse(frameworks);
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

    if (body.type === 'framework') {
      const result = await client.call(WS.CORE_COMPETENCY_CREATE_COMPETENCY_FRAMEWORK, body.data);
      return jsonResponse(result, 201);
    }

    const result = await client.call(WS.CORE_COMPETENCY_CREATE_COMPETENCY, body);
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
