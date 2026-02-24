import { jsonResponse, isServerDemoMode } from '@/lib/api/helpers';

export async function GET() {
  const checks: Record<string, string> = {
    frontend: 'ok',
    mode: isServerDemoMode ? 'demo' : 'production',
  };

  // Check Moodle connectivity (server-side only, non-demo)
  if (!isServerDemoMode) {
    const moodleUrl = process.env.MOODLE_URL;
    const wsToken = process.env.MOODLE_WS_TOKEN;

    if (!moodleUrl || !wsToken) {
      checks.moodle = 'misconfigured (missing MOODLE_URL or MOODLE_WS_TOKEN)';
    } else {
      try {
        const body = new URLSearchParams({
          wstoken: wsToken,
          wsfunction: 'core_webservice_get_site_info',
          moodlewsrestformat: 'json',
        });
        const res = await fetch(`${moodleUrl}/webservice/rest/server.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sitename) {
            checks.moodle = 'ok';
            checks.moodleSite = data.sitename;
          } else if (data.exception) {
            checks.moodle = `error: ${data.message}`;
          }
        } else {
          checks.moodle = `unreachable (HTTP ${res.status})`;
        }
      } catch (e) {
        checks.moodle = `unreachable (${e instanceof Error ? e.message : 'unknown'})`;
      }
    }

    // Check Cognito config
    const cognitoPoolId = process.env.COGNITO_USER_POOL_ID;
    const cognitoClientId = process.env.COGNITO_CLIENT_ID;
    checks.cognito = cognitoPoolId && cognitoClientId ? 'configured' : 'misconfigured';
  }

  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks,
  });
}
