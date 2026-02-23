import type { NextRequest } from 'next/server';
import { verifyRequest, assertRole } from '@/lib/auth/jwt-verifier';
import { createMoodleClient } from '@/lib/moodle/client';
import { WS } from '@/lib/moodle/endpoints';
import { jsonResponse, handleApiError } from '@/lib/api/helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const { id } = await params;
    const client = createMoodleClient();
    const users = await client.call(WS.CORE_USER_GET_USERS_BY_FIELD, {
      field: 'id',
      values: [id],
    });
    return jsonResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const { id } = await params;
    const body = await request.json();
    const client = createMoodleClient();
    const result = await client.call(WS.CORE_USER_UPDATE_USERS, {
      users: [{ id: Number(id), ...body }],
    });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyRequest(request);
    assertRole(payload, ['ADMIN']);
    const { id } = await params;
    const client = createMoodleClient();
    const result = await client.call(WS.CORE_USER_UPDATE_USERS, {
      users: [{ id: Number(id), suspended: 1 }],
    });
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
