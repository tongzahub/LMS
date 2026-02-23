import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import type { UserRole } from './types';

/** Singleton JWT verifier for Cognito access tokens */
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!userPoolId || !clientId) {
      throw new Error('Missing COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID environment variables');
    }
    verifier = CognitoJwtVerifier.create({
      userPoolId,
      clientId,
      tokenUse: 'access',
    });
  }
  return verifier;
}

/**
 * Extracts Bearer token from the Authorization header and verifies it
 * against the Cognito User Pool.
 *
 * @returns Decoded JWT payload
 * @throws 401-style error if token is missing, malformed, or invalid
 */
export async function verifyRequest(request: Request): Promise<CognitoJwtPayload> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new JwtError('Missing Authorization header');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new JwtError('Malformed Authorization header — expected "Bearer <token>"');
  }

  const token = parts[1];
  try {
    return await getVerifier().verify(token);
  } catch {
    throw new JwtError('Invalid or expired token');
  }
}

/**
 * Asserts that the JWT payload contains at least one of the allowed roles
 * in the `cognito:groups` claim.
 *
 * @throws 403-style error if the user lacks an authorized role
 */
export function assertRole(payload: CognitoJwtPayload, allowedRoles: UserRole[]): void {
  const groups = (payload as Record<string, unknown>)['cognito:groups'];
  if (!Array.isArray(groups)) {
    throw new RoleError('No cognito:groups claim in token');
  }

  const GROUP_TO_ROLE: Record<string, UserRole> = {
    ADMINS: 'ADMIN',
    TEACHERS: 'TEACHER',
    STUDENTS: 'STUDENT',
  };

  const userRoles = groups
    .map((g: string) => GROUP_TO_ROLE[g])
    .filter((r): r is UserRole => r !== undefined);

  const hasAllowedRole = userRoles.some((r) => allowedRoles.includes(r));
  if (!hasAllowedRole) {
    throw new RoleError('Insufficient permissions');
  }
}

/** Error thrown when JWT verification fails (maps to 401) */
export class JwtError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JwtError';
  }
}

/** Error thrown when role check fails (maps to 403) */
export class RoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoleError';
  }
}

/** Reset the singleton verifier (for testing) */
export function _resetVerifier() {
  verifier = null;
}
