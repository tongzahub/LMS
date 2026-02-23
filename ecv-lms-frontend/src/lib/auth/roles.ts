import type { UserRole } from './types';

/** Cognito group names mapped to application roles */
const GROUP_TO_ROLE: Record<string, UserRole> = {
  ADMINS: 'ADMIN',
  TEACHERS: 'TEACHER',
  STUDENTS: 'STUDENT',
};

/** Role precedence — lower index = higher precedence */
const ROLE_PRECEDENCE: UserRole[] = ['ADMIN', 'TEACHER', 'STUDENT'];

/**
 * Extracts `cognito:groups` from an auth session's access token payload
 * and returns the highest-precedence role.
 *
 * @throws if no recognized Cognito group is found
 */
export function resolveRole(session: { tokens?: { accessToken?: { payload?: Record<string, unknown> } } }): UserRole {
  const groups = session?.tokens?.accessToken?.payload?.['cognito:groups'];

  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error('No cognito:groups found in access token');
  }

  const roles = groups
    .map((g: string) => GROUP_TO_ROLE[g])
    .filter((r): r is UserRole => r !== undefined);

  if (roles.length === 0) {
    throw new Error('No recognized role found in cognito:groups');
  }

  // Return the role with the highest precedence (lowest index)
  for (const role of ROLE_PRECEDENCE) {
    if (roles.includes(role)) return role;
  }

  return roles[0];
}
