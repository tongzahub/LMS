import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';

// Shared mock verify function that all tests can control
const mockVerify = vi.fn();

vi.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: () => ({ verify: mockVerify }),
  },
}));

// Must import AFTER vi.mock so the mock is in place
import { verifyRequest, assertRole, JwtError, RoleError, _resetVerifier } from '../jwt-verifier';

function makeRequest(authHeader?: string): Request {
  const headers = new Headers();
  if (authHeader !== undefined) {
    headers.set('authorization', authHeader);
  }
  return new Request('https://example.com/api/test', { headers });
}

const mockPayload = {
  sub: 'user-123',
  iss: 'https://cognito-idp.ap-southeast-1.amazonaws.com/pool-id',
  client_id: 'client-id',
  token_use: 'access',
  exp: 1700003600,
  iat: 1700000000,
  jti: 'jti-123',
  username: 'user@example.com',
  'cognito:groups': ['STUDENTS'],
} as unknown as CognitoJwtPayload;

describe('verifyRequest', () => {
  beforeEach(() => {
    mockVerify.mockReset();
    _resetVerifier();
    process.env.COGNITO_USER_POOL_ID = 'ap-southeast-1_test';
    process.env.COGNITO_CLIENT_ID = 'test-client-id';
  });

  it('throws JwtError when Authorization header is missing', async () => {
    const req = makeRequest();
    await expect(verifyRequest(req)).rejects.toThrow(JwtError);
    await expect(verifyRequest(makeRequest())).rejects.toThrow('Missing Authorization header');
  });

  it('throws JwtError when Authorization header is not Bearer format', async () => {
    const req = makeRequest('Basic abc123');
    await expect(verifyRequest(req)).rejects.toThrow(JwtError);
  });

  it('throws JwtError when token has no space separator', async () => {
    const req = makeRequest('BearerTokenWithoutSpace');
    await expect(verifyRequest(req)).rejects.toThrow(JwtError);
  });

  it('returns decoded payload for a valid token', async () => {
    mockVerify.mockResolvedValueOnce(mockPayload);

    const req = makeRequest('Bearer valid-token');
    const result = await verifyRequest(req);
    expect(result).toEqual(mockPayload);
    expect(mockVerify).toHaveBeenCalledWith('valid-token');
  });

  it('throws JwtError when token verification fails', async () => {
    mockVerify.mockRejectedValue(new Error('Token expired'));

    const req = makeRequest('Bearer expired-token');
    await expect(verifyRequest(req)).rejects.toThrow(JwtError);
    await expect(verifyRequest(makeRequest('Bearer expired-token'))).rejects.toThrow(
      'Invalid or expired token',
    );
  });
});

describe('assertRole', () => {
  it('passes when user has an allowed role', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['STUDENTS'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['STUDENT'])).not.toThrow();
  });

  it('passes when user has one of multiple allowed roles', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['TEACHERS'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['ADMIN', 'TEACHER'])).not.toThrow();
  });

  it('throws RoleError when user lacks an allowed role', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['STUDENTS'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['ADMIN', 'TEACHER'])).toThrow(RoleError);
    expect(() => assertRole(payload, ['ADMIN', 'TEACHER'])).toThrow('Insufficient permissions');
  });

  it('throws RoleError when cognito:groups is missing', () => {
    const payload = { sub: 'user-123' } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['STUDENT'])).toThrow(RoleError);
    expect(() => assertRole(payload, ['STUDENT'])).toThrow('No cognito:groups claim');
  });

  it('throws RoleError when cognito:groups contains no recognized groups', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['UNKNOWN_GROUP'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['STUDENT'])).toThrow(RoleError);
  });

  it('handles ADMIN group correctly', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['ADMINS'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['ADMIN'])).not.toThrow();
  });

  it('handles multiple groups — passes if any match', () => {
    const payload = {
      ...mockPayload,
      'cognito:groups': ['STUDENTS', 'TEACHERS'],
    } as unknown as CognitoJwtPayload;
    expect(() => assertRole(payload, ['TEACHER'])).not.toThrow();
  });
});
