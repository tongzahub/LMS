/** Moodle Web Service error response shape */
export interface MoodleErrorResponse {
  exception: string;
  errorcode: string;
  message: string;
  debuginfo?: string;
}

/** Structured error returned by the BFF to the frontend */
export interface BffError {
  status: number;
  error: string;
  message: string;
}

/** Type guard: checks if a Moodle response is an error */
export function isMoodleError(response: unknown): response is MoodleErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'exception' in response &&
    'errorcode' in response &&
    'message' in response
  );
}
