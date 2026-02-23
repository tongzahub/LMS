import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MoodleRestClient, MoodleClientError } from '../client';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'https://moodle.example.com';
const WS_TOKEN = 'secret-ws-token-abc123';

describe('MoodleRestClient', () => {
  let client: MoodleRestClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MoodleRestClient(BASE_URL, WS_TOKEN);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST to the correct Moodle WS endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, fullname: 'Course 1' }],
    });

    await client.call('core_course_get_courses', { options: { ids: [1] } });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/webservice/rest/server.php`);
    expect(options.method).toBe('POST');
  });

  it('includes wstoken, wsfunction, and moodlewsrestformat in the body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] }),
    });

    await client.call('core_course_search_courses', { criterianame: 'search', criteriavalue: 'math' });

    const body = mockFetch.mock.calls[0][1].body as string;
    const params = new URLSearchParams(body);
    expect(params.get('wstoken')).toBe(WS_TOKEN);
    expect(params.get('wsfunction')).toBe('core_course_search_courses');
    expect(params.get('moodlewsrestformat')).toBe('json');
    expect(params.get('criterianame')).toBe('search');
    expect(params.get('criteriavalue')).toBe('math');
  });

  it('flattens nested params using bracket notation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await client.call('core_user_create_users', {
      users: [{ email: 'a@b.com', firstname: 'A' }],
    });

    const body = mockFetch.mock.calls[0][1].body as string;
    const params = new URLSearchParams(body);
    expect(params.get('users[0][email]')).toBe('a@b.com');
    expect(params.get('users[0][firstname]')).toBe('A');
  });

  it('returns parsed JSON on success', async () => {
    const expected = [{ id: 1, fullname: 'Course 1' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => expected,
    });

    const result = await client.call('core_course_get_courses', {});
    expect(result).toEqual(expected);
  });

  it('throws MoodleClientError when HTTP response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 });

    await expect(client.call('core_course_get_courses', {})).rejects.toThrow(
      MoodleClientError,
    );
    await expect(client.call('core_course_get_courses', {})).rejects.toThrow(
      'LMS service temporarily unavailable',
    );
  });

  it('throws MoodleClientError when Moodle returns an error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exception: 'moodle_exception',
        errorcode: 'invalidparameter',
        message: 'Some internal detail',
      }),
    });

    try {
      await client.call('core_course_get_courses', {});
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(MoodleClientError);
      const mce = err as MoodleClientError;
      expect(mce.status).toBe(400);
      expect(mce.error).toBe('Bad Request');
      // Must NOT contain raw Moodle error message
      expect(mce.userMessage).not.toContain('Some internal detail');
    }
  });

  it('never includes the WS token in thrown errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exception: 'moodle_exception',
        errorcode: 'invalidtoken',
        message: 'Invalid token',
      }),
    });

    try {
      await client.call('test_func', {});
      expect.fail('Should have thrown');
    } catch (err) {
      const errStr = JSON.stringify(err);
      expect(errStr).not.toContain(WS_TOKEN);
    }
  });
});
