import { describe, it, expect } from 'vitest';
import { mapMoodleError } from '../error-mapping';
import type { MoodleErrorResponse } from '../types';

describe('mapMoodleError', () => {
  it('maps invalidparameter to 400 Bad Request', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'invalid_parameter_exception',
      errorcode: 'invalidparameter',
      message: 'Parameter users is not valid',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.status).toBe(400);
    expect(result.error).toBe('Bad Request');
    expect(result.message).not.toContain('Parameter users');
  });

  it('maps invalidtoken to 401 Unauthorized', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'moodle_exception',
      errorcode: 'invalidtoken',
      message: 'Invalid token - token not found',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.status).toBe(401);
    expect(result.error).toBe('Unauthorized');
  });

  it('maps accessexception to 403 Forbidden', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'required_capability_exception',
      errorcode: 'accessexception',
      message: 'Access denied for user',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.status).toBe(403);
    expect(result.error).toBe('Forbidden');
  });

  it('maps invalidrecord to 404 Not Found', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'dml_missing_record_exception',
      errorcode: 'invalidrecord',
      message: 'Can not find data record in database',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.status).toBe(404);
    expect(result.error).toBe('Not Found');
  });

  it('maps unknown error codes to 502 Bad Gateway', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'some_unknown_exception',
      errorcode: 'unknownerror',
      message: 'Something went wrong internally',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.status).toBe(502);
    expect(result.error).toBe('Bad Gateway');
    expect(result.message).toBe('LMS service temporarily unavailable');
  });

  it('never exposes raw Moodle error message in the output', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'dml_write_exception',
      errorcode: 'dmlwriteexception',
      message: 'Error writing to database table mdl_user',
      debuginfo: 'SQL: INSERT INTO mdl_user ...',
    };
    const result = mapMoodleError(moodleErr);
    expect(result.message).not.toContain('mdl_user');
    expect(result.message).not.toContain('SQL');
    expect(JSON.stringify(result)).not.toContain('debuginfo');
  });

  it('returns a well-structured BffError shape', () => {
    const moodleErr: MoodleErrorResponse = {
      exception: 'moodle_exception',
      errorcode: 'nopermissions',
      message: 'Sorry, but you do not currently have permissions',
    };
    const result = mapMoodleError(moodleErr);
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('message');
    expect(typeof result.status).toBe('number');
    expect(typeof result.error).toBe('string');
    expect(typeof result.message).toBe('string');
  });
});
