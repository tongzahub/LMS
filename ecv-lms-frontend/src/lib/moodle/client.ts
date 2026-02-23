import { isMoodleError } from './types';
import type { MoodleErrorResponse } from './types';
import { mapMoodleError } from './error-mapping';

export interface MoodleClient {
  call<T>(wsfunction: string, params: Record<string, unknown>): Promise<T>;
}

/**
 * Server-side REST client for Moodle Web Services.
 * The WS token is kept exclusively on the server — it must never leak to the client.
 */
export class MoodleRestClient implements MoodleClient {
  constructor(
    private readonly baseUrl: string,
    private readonly wsToken: string,
  ) {}

  async call<T>(wsfunction: string, params: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/webservice/rest/server.php`;

    const body = new URLSearchParams();
    body.set('wstoken', this.wsToken);
    body.set('wsfunction', wsfunction);
    body.set('moodlewsrestformat', 'json');
    flattenParams(params, body);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new MoodleClientError(
        502,
        'Bad Gateway',
        'LMS service temporarily unavailable',
      );
    }

    const data: unknown = await response.json();

    if (isMoodleError(data)) {
      const mapped = mapMoodleError(data as MoodleErrorResponse);
      throw new MoodleClientError(mapped.status, mapped.error, mapped.message);
    }

    return data as T;
  }
}

/** Error thrown by the Moodle client — carries HTTP status for the BFF response */
export class MoodleClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    public readonly userMessage: string,
  ) {
    super(userMessage);
    this.name = 'MoodleClientError';
  }
}

/**
 * Flattens nested params into URLSearchParams using Moodle's bracket notation.
 * e.g. { users: [{ email: 'a' }] } → users[0][email]=a
 */
function flattenParams(
  obj: Record<string, unknown>,
  out: URLSearchParams,
  prefix = '',
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          flattenParams(item as Record<string, unknown>, out, `${fullKey}[${i}]`);
        } else {
          out.set(`${fullKey}[${i}]`, String(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      flattenParams(value as Record<string, unknown>, out, fullKey);
    } else if (value !== undefined && value !== null) {
      out.set(fullKey, String(value));
    }
  }
}

/** Creates a MoodleRestClient from environment variables */
export function createMoodleClient(): MoodleRestClient {
  const baseUrl = process.env.MOODLE_URL;
  const wsToken = process.env.MOODLE_WS_TOKEN;
  if (!baseUrl || !wsToken) {
    throw new Error('Missing MOODLE_URL or MOODLE_WS_TOKEN environment variables');
  }
  return new MoodleRestClient(baseUrl, wsToken);
}
