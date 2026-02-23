import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface CognitoTriggersProps {
  moodleUrl: string;
  moodleWsTokenSecret: secretsmanager.ISecret;
  userPoolId: string;
  environment: string;
}

/**
 * CDK construct that defines Cognito User Pool Lambda triggers for
 * post-confirmation user provisioning, token enrichment, and branded messaging.
 */
export class CognitoTriggers extends Construct {
  public readonly postConfirmation: lambda.Function;
  public readonly preTokenGeneration: lambda.Function;
  public readonly customMessage: lambda.Function;

  constructor(scope: Construct, id: string, props: CognitoTriggersProps) {
    super(scope, id);

    const { moodleUrl, moodleWsTokenSecret, userPoolId, environment } = props;

    // --- Post-Confirmation Lambda ---
    // Creates a Moodle user via WS API after Cognito email confirmation,
    // stores moodle_user_id as custom attribute, and adds user to STUDENTS group.
    this.postConfirmation = new lambda.Function(this, 'PostConfirmationFn', {
      functionName: `moodle-${environment}-post-confirmation`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: 'Creates Moodle user after Cognito email confirmation and assigns STUDENTS group',
      environment: {
        MOODLE_URL: moodleUrl,
        MOODLE_WS_TOKEN: moodleWsTokenSecret.secretArn,
        USER_POOL_ID: userPoolId,
      },
      code: lambda.Code.fromInline(POST_CONFIRMATION_CODE),
    });

    // Grant read access to the WS token secret
    moodleWsTokenSecret.grantRead(this.postConfirmation);

    // Allow post-confirmation Lambda to manage Cognito user attributes and groups
    this.postConfirmation.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'cognito-idp:AdminUpdateUserAttributes',
          'cognito-idp:AdminAddUserToGroup',
        ],
        resources: [
          cdk.Arn.format(
            { service: 'cognito-idp', resource: 'userpool', resourceName: userPoolId },
            cdk.Stack.of(this),
          ),
        ],
      }),
    );

    // --- Pre-Token Generation Lambda ---
    // Enriches ID and access tokens with moodle_user_id and permissions claims.
    this.preTokenGeneration = new lambda.Function(this, 'PreTokenGenerationFn', {
      functionName: `moodle-${environment}-pre-token-generation`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      description: 'Adds moodle_user_id and permissions claims to Cognito tokens',
      environment: {
        USER_POOL_ID: userPoolId,
      },
      code: lambda.Code.fromInline(PRE_TOKEN_GENERATION_CODE),
    });

    // --- Custom Message Lambda ---
    // Branded email templates for verification and password reset in Thai/English.
    this.customMessage = new lambda.Function(this, 'CustomMessageFn', {
      functionName: `moodle-${environment}-custom-message`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      description: 'Branded email templates for ECV Learning Solutions (Thai/English)',
      code: lambda.Code.fromInline(CUSTOM_MESSAGE_CODE),
    });

    // --- Tags ---
    cdk.Tags.of(this).add('Project', 'MoodleLMS');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'cdk');
  }
}

// ---------------------------------------------------------------------------
// Inline Lambda handler code
// ---------------------------------------------------------------------------

const POST_CONFIRMATION_CODE = `
const https = require('https');
const { URL } = require('url');
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand, AdminAddUserToGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const cognito = new CognitoIdentityProviderClient();
const sm = new SecretsManagerClient();

let cachedToken = null;

async function getWsToken() {
  if (cachedToken) return cachedToken;
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: process.env.MOODLE_WS_TOKEN }));
  cachedToken = resp.SecretString;
  return cachedToken;
}

function moodleApiCall(moodleUrl, wsToken, wsFunction, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(moodleUrl + '/webservice/rest/server.php');
    url.searchParams.set('wstoken', wsToken);
    url.searchParams.set('wsfunction', wsFunction);
    url.searchParams.set('moodlewsrestformat', 'json');
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    https.get(url.toString(), (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Invalid JSON: ' + data)); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') return event;

  const { email, given_name, family_name } = event.request.userAttributes;
  const username = event.userName;
  const userPoolId = process.env.USER_POOL_ID;
  const wsToken = await getWsToken();

  // Create Moodle user via WS API
  const result = await moodleApiCall(process.env.MOODLE_URL, wsToken, 'core_user_create_users', {
    'users[0][username]': email,
    'users[0][password]': 'Cognito_SSO_' + Date.now(),
    'users[0][firstname]': given_name || '',
    'users[0][lastname]': family_name || '',
    'users[0][email]': email,
    'users[0][auth]': 'oauth2',
  });

  if (result && result[0] && result[0].id) {
    const moodleUserId = String(result[0].id);

    // Store moodle_user_id as custom Cognito attribute
    await cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [{ Name: 'custom:moodle_user_id', Value: moodleUserId }],
    }));

    // Add user to STUDENTS group
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: 'STUDENTS',
    }));
  }

  return event;
};
`;

const PRE_TOKEN_GENERATION_CODE = `
exports.handler = async (event) => {
  const userAttributes = event.request.userAttributes || {};
  const groups = event.request.groupConfiguration?.groupsToOverride || [];

  // Derive permissions from Cognito groups
  const permissionsMap = {
    ADMINS: ['admin:full'],
    MANAGERS: ['manage:courses', 'manage:users', 'view:reports'],
    TEACHERS: ['teach:courses', 'grade:students', 'view:reports'],
    STUDENTS: ['enroll:courses', 'view:own'],
  };

  const permissions = [];
  for (const group of groups) {
    if (permissionsMap[group]) permissions.push(...permissionsMap[group]);
  }

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        'custom:moodle_user_id': userAttributes['custom:moodle_user_id'] || '',
        'custom:permissions': JSON.stringify([...new Set(permissions)]),
      },
    },
  };

  return event;
};
`;

const CUSTOM_MESSAGE_CODE = `
exports.handler = async (event) => {
  const locale = (event.request.userAttributes?.locale || 'en').toLowerCase();
  const isThai = locale.startsWith('th');
  const code = event.request.codeParameter || '{####}';
  const link = event.request.linkParameter || '{##Click Here##}';

  const brandColor = '#1a73e8';
  const header = isThai ? 'ECV Learning Solutions' : 'ECV Learning Solutions';

  const wrapHtml = (title, body) => \`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:\${brandColor};padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">\${header}</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#333;margin-top:0">\${title}</h2>
      \${body}
    </div>
    <div style="background:#f9f9f9;padding:16px;text-align:center;font-size:12px;color:#999">
      &copy; \${new Date().getFullYear()} ECV Learning Solutions
    </div>
  </div>
</body>
</html>\`;

  switch (event.triggerSource) {
    case 'CustomMessage_SignUp':
    case 'CustomMessage_ResendCode': {
      const title = isThai ? 'ยืนยันอีเมลของคุณ' : 'Verify Your Email';
      const bodyText = isThai
        ? '<p>ขอบคุณที่ลงทะเบียน กรุณาใช้รหัสยืนยันด้านล่าง:</p>'
        : '<p>Thank you for registering. Please use the verification code below:</p>';
      const body = bodyText + '<p style="text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:' + brandColor + '">' + code + '</p>';
      event.response.emailSubject = isThai ? 'ECV Learning - ยืนยันอีเมล' : 'ECV Learning - Verify Your Email';
      event.response.emailMessage = wrapHtml(title, body);
      break;
    }
    case 'CustomMessage_ForgotPassword': {
      const title = isThai ? 'รีเซ็ตรหัสผ่าน' : 'Reset Your Password';
      const bodyText = isThai
        ? '<p>เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กรุณาใช้รหัสด้านล่าง:</p>'
        : '<p>We received a request to reset your password. Use the code below:</p>';
      const body = bodyText + '<p style="text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:' + brandColor + '">' + code + '</p>';
      event.response.emailSubject = isThai ? 'ECV Learning - รีเซ็ตรหัสผ่าน' : 'ECV Learning - Reset Your Password';
      event.response.emailMessage = wrapHtml(title, body);
      break;
    }
    default:
      break;
  }

  return event;
};
`;
