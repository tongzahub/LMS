import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Fetches the current Amplify auth session.
 * Returns null if no session exists.
 */
export async function fetchSession() {
  try {
    return await fetchAuthSession();
  } catch {
    return null;
  }
}

/**
 * Extracts the access token JWT string from the current session.
 * Returns null if unavailable.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await fetchSession();
  return session?.tokens?.accessToken?.toString() ?? null;
}

/**
 * Extracts the ID token JWT string from the current session.
 * The ID token contains user attributes (custom:moodle_user_id, email, etc.)
 * and cognito:groups — used by BFF routes that need moodle_user_id.
 */
export async function getIdToken(): Promise<string | null> {
  const session = await fetchSession();
  return session?.tokens?.idToken?.toString() ?? null;
}

/**
 * Checks whether the current session has valid (non-expired) tokens.
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await fetchSession();
  if (!session?.tokens?.idToken) return false;

  const exp = session.tokens.idToken.payload?.exp;
  if (typeof exp !== 'number') return false;

  return Date.now() < exp * 1000;
}
