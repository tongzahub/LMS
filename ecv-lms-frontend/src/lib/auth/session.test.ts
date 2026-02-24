import { describe, it, expect, vi } from 'vitest';

// Mock aws-amplify/auth before importing session module
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
}));

import { fetchSession, getAccessToken, isSessionValid } from './session';
import { fetchAuthSession } from 'aws-amplify/auth';

const mockFetchAuthSession = vi.mocked(fetchAuthSession);

describe('fetchSession', () => {
  it('returns session when available', async () => {
    const session = { tokens: { accessToken: { toString: () => 'jwt' } } };
    mockFetchAuthSession.mockResolvedValue(session as never);
    expect(await fetchSession()).toBe(session);
  });

  it('returns null when fetchAuthSession throws', async () => {
    mockFetchAuthSession.mockRejectedValue(new Error('no session'));
    expect(await fetchSession()).toBeNull();
  });
});

describe('getAccessToken', () => {
  it('returns token string when session exists', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: { accessToken: { toString: () => 'my-jwt-token' } },
    } as never);
    expect(await getAccessToken()).toBe('my-jwt-token');
  });

  it('returns null when no tokens', async () => {
    mockFetchAuthSession.mockResolvedValue({} as never);
    expect(await getAccessToken()).toBeNull();
  });
});

describe('isSessionValid', () => {
  it('returns true when token is not expired', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    mockFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { exp: futureExp } } },
    } as never);
    expect(await isSessionValid()).toBe(true);
  });

  it('returns false when token is expired', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    mockFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { exp: pastExp } } },
    } as never);
    expect(await isSessionValid()).toBe(false);
  });

  it('returns false when no session', async () => {
    mockFetchAuthSession.mockRejectedValue(new Error('no session'));
    expect(await isSessionValid()).toBe(false);
  });
});
