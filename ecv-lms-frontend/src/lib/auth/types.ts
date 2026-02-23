export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  cognitoSub: string;
  email: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  moodleUserId: number;
  institution?: string;
  locale: 'th' | 'en';
}

export interface SignUpParams {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}

export interface SignInResult {
  isSignedIn: boolean;
  nextStep?: { signInStep: string };
}

export interface SignUpResult {
  isSignUpComplete: boolean;
  nextStep?: { signUpStep: string };
}
