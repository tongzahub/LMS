import { describe, it, expect } from 'vitest';
import { resolveRole } from './roles';

function mockSession(groups: string[]) {
  return {
    tokens: {
      accessToken: {
        payload: { 'cognito:groups': groups },
      },
    },
  };
}

describe('resolveRole', () => {
  it('returns ADMIN when ADMINS group is present', () => {
    expect(resolveRole(mockSession(['ADMINS']))).toBe('ADMIN');
  });

  it('returns TEACHER when TEACHERS group is present', () => {
    expect(resolveRole(mockSession(['TEACHERS']))).toBe('TEACHER');
  });

  it('returns STUDENT when STUDENTS group is present', () => {
    expect(resolveRole(mockSession(['STUDENTS']))).toBe('STUDENT');
  });

  it('returns ADMIN when user has multiple groups (highest precedence)', () => {
    expect(resolveRole(mockSession(['STUDENTS', 'ADMINS', 'TEACHERS']))).toBe('ADMIN');
  });

  it('returns TEACHER over STUDENT', () => {
    expect(resolveRole(mockSession(['STUDENTS', 'TEACHERS']))).toBe('TEACHER');
  });

  it('throws when groups array is empty', () => {
    expect(() => resolveRole(mockSession([]))).toThrow('No cognito:groups found');
  });

  it('throws when no recognized group is found', () => {
    expect(() => resolveRole(mockSession(['UNKNOWN_GROUP']))).toThrow('No recognized role');
  });

  it('throws when session has no tokens', () => {
    expect(() => resolveRole({})).toThrow('No cognito:groups found');
  });

  it('throws when payload has no cognito:groups', () => {
    expect(() =>
      resolveRole({ tokens: { accessToken: { payload: {} } } }),
    ).toThrow('No cognito:groups found');
  });
});
