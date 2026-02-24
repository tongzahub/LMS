import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { MoodleConfig } from '../config';
import { CognitoTriggers } from './cognito-triggers';

export interface CognitoProps {
  moodleWsTokenSecret: secretsmanager.ISecret;
  config: MoodleConfig;
}

export class Cognito extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id);

    const { config, moodleWsTokenSecret } = props;

    // --- User Pool ---
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `moodle-${config.environment}-users`,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
        emailSubject: 'ECV Learning - Verify Your Email',
        emailBody: 'Your verification code is {####}',
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
        locale: { required: false, mutable: true },
      },
      customAttributes: {
        moodle_user_id: new cognito.StringAttribute({ mutable: true }),
        institution: new cognito.StringAttribute({ mutable: true }),
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // --- User Pool Domain (prefix-based) ---
    this.userPoolDomain = this.userPool.addDomain('Domain', {
      cognitoDomain: {
        domainPrefix: config.cognitoDomainPrefix,
      },
    });

    // --- App Client (public, no secret) ---
    this.userPoolClient = this.userPool.addClient('AppClient', {
      userPoolClientName: `moodle-${config.environment}-web`,
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          `https://${config.domainName}`,
          'http://localhost:3000',
        ],
        logoutUrls: [
          `https://${config.domainName}`,
          'http://localhost:3000',
        ],
      },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // --- Groups ---
    new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'ADMINS',
      description: 'Full administrative access',
      precedence: 0,
    });

    new cognito.CfnUserPoolGroup(this, 'TeachersGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'TEACHERS',
      description: 'Teaching staff',
      precedence: 10,
    });

    new cognito.CfnUserPoolGroup(this, 'StudentsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'STUDENTS',
      description: 'Student users',
      precedence: 20,
    });

    // --- Lambda Triggers ---
    const triggers = new CognitoTriggers(this, 'Triggers', {
      moodleUrl: `https://${config.domainName}`,
      moodleWsTokenSecret,
      userPoolId: this.userPool.userPoolId,
      environment: config.environment,
    });

    this.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      triggers.postConfirmation,
    );
    this.userPool.addTrigger(
      cognito.UserPoolOperation.PRE_TOKEN_GENERATION,
      triggers.preTokenGeneration,
    );
    this.userPool.addTrigger(
      cognito.UserPoolOperation.CUSTOM_MESSAGE,
      triggers.customMessage,
    );

    // --- CloudFormation Outputs ---
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool App Client ID',
    });

    new cdk.CfnOutput(this, 'UserPoolDomainName', {
      value: `${config.cognitoDomainPrefix}.auth.${cdk.Stack.of(this).region}.amazoncognito.com`,
      description: 'Cognito User Pool Domain',
    });
  }
}
