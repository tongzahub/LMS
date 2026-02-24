import { Amplify } from 'aws-amplify';
import { isDemoMode } from './demo';

/**
 * Configures AWS Amplify for Cognito authentication and S3 storage.
 * In demo mode, Amplify is configured with dummy values to avoid
 * initialization errors — the AuthContext skips all Amplify calls in demo mode.
 */
export function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? '';
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '';
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID ?? '';
  const mediaBucket = process.env.NEXT_PUBLIC_MEDIA_BUCKET ?? '';
  const mediaRegion = process.env.NEXT_PUBLIC_AWS_REGION ?? 'ap-southeast-1';

  // Skip Amplify configuration entirely if in demo mode and env vars are placeholders
  if (isDemoMode && (!userPoolId || userPoolId.includes('XXXXXXXXX'))) {
    return;
  }

  // Validate that required env vars are set for production mode
  if (!isDemoMode && (!userPoolId || !clientId || !domain)) {
    console.error(
      '[ECV LMS] Missing Cognito environment variables. Set NEXT_PUBLIC_COGNITO_USER_POOL_ID, ' +
      'NEXT_PUBLIC_COGNITO_CLIENT_ID, and NEXT_PUBLIC_COGNITO_DOMAIN, or enable NEXT_PUBLIC_DEMO_MODE=true.',
    );
    return;
  }

  const config: Record<string, unknown> = {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
        identityPoolId: identityPoolId || undefined,
        loginWith: {
          oauth: {
            domain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'],
            redirectSignOut: [typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'],
            responseType: 'code',
          },
        },
      },
    },
  };

  // Add Storage config if media bucket is configured
  if (mediaBucket) {
    (config as Record<string, unknown>).Storage = {
      S3: {
        bucket: mediaBucket,
        region: mediaRegion,
      },
    };
  }

  Amplify.configure(config);
}
