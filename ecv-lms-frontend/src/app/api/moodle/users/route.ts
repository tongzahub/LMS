import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field') ?? 'email';
    const value = searchParams.get('value') ?? '';
    const client = createMoodleClient();
    const users = await client.call(WS.CORE_USER_GET_USERS, {
      criteria: [{ key: field, value }],
    });
    return jsonResponse(users);
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
    const result = await client.call(WS.CORE_USER_CREATE_USERS, { users: [body] });
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
