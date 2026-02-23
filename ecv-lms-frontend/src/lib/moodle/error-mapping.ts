import type { MoodleErrorResponse, BffError } from './types';

/** Maps known Moodle error codes to HTTP status codes */
const ERROR_CODE_MAP: Record<string, number> = {
  invalidtoken: 401,
  accessexception: 403,
  invalidparameter: 400,
  invalidrecord: 404,
  dmlwriteexception: 500,
  requireloginerror: 401,
  webloginrequired: 401,
  forabortedbycallback: 400,
  nopermissions: 403,
  notloggedin: 401,
};

/** User-friendly messages for known error codes */
const FRIENDLY_MESSAGES: Record<string, string> = {
  invalidtoken: 'Authentication with the LMS failed',
  accessexception: 'You do not have permission to perform this action',
  invalidparameter: 'The request contained invalid parameters',
  invalidrecord: 'The requested resource was not found',
  requireloginerror: 'LMS authentication required',
  nopermissions: 'You do not have permission to perform this action',
};

/**
 * Maps a Moodle Web Service error response to a structured BFF error.
 * Never exposes raw Moodle error details (exception class, debuginfo) to the client.
 */
export function mapMoodleError(moodleResponse: MoodleErrorResponse): BffError {
  const status = ERROR_CODE_MAP[moodleResponse.errorcode] ?? 502;
  const message =
    FRIENDLY_MESSAGES[moodleResponse.errorcode] ??
    'LMS service temporarily unavailable';

  return { status, error: httpStatusLabel(status), message };
}

function httpStatusLabel(status: number): string {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 502: return 'Bad Gateway';
    default:  return 'Internal Server Error';
  }
}
