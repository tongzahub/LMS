'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { fetchSession } from '@/lib/auth/session';
import { resolveRole } from '@/lib/auth/roles';
import { isDemoMode } from '@/lib/demo';
import type { AuthUser, UserRole, SignUpParams, SignInResult, SignUpResult } from '@/lib/auth/types';

export interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (params: SignUpParams) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

const DEMO_USER: AuthUser = {
  cognitoSub: 'demo-admin-001',
  email: 'admin@ecv.ac.th',
  givenName: 'สมชาย',
  familyName: 'วงศ์ประเสริฐ',
  role: 'ADMIN',
  moodleUserId: 1,
  institution: 'ECV Learning Solutions',
  locale: 'en',
};

async function buildAuthUser(role: UserRole): Promise<AuthUser> {
  const cognitoUser = await getCurrentUser();
  const attrs = await fetchUserAttributes();

  return {
    cognitoSub: cognitoUser.userId,
    email: attrs.email ?? '',
    givenName: attrs.given_name ?? '',
    familyName: attrs.family_name ?? '',
    role,
    moodleUserId: Number(attrs['custom:moodle_user_id'] ?? 0),
    institution: attrs['custom:institution'] ?? undefined,
    locale: (attrs.locale as 'th' | 'en') ?? 'en',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (isDemoMode) {
      // Brief delay to simulate async initialization
      await new Promise((r) => setTimeout(r, 300));
      setUser(DEMO_USER);
      setRole('ADMIN');
      setIsLoading(false);
      return;
    }

    try {
      const session = await fetchSession();
      if (!session?.tokens?.accessToken) {
        setUser(null);
        setRole(null);
        return;
      }
      const resolvedRole = resolveRole(session);
      const authUser = await buildAuthUser(resolvedRole);
      setUser(authUser);
      setRole(resolvedRole);
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSignIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    if (isDemoMode) {
      // Accept any credentials in demo mode
      void email;
      void password;
      setUser(DEMO_USER);
      setRole('ADMIN');
      return { isSignedIn: true };
    }
    const result = await amplifySignIn({ username: email, password });
    if (result.isSignedIn) await loadUser();
    return {
      isSignedIn: result.isSignedIn,
      nextStep: result.nextStep ? { signInStep: result.nextStep.signInStep } : undefined,
    };
  }, [loadUser]);

  const handleSignUp = useCallback(async (params: SignUpParams): Promise<SignUpResult> => {
    if (isDemoMode) {
      return { isSignUpComplete: true };
    }
    const result = await amplifySignUp({
      username: params.email,
      password: params.password,
      options: {
        userAttributes: {
          email: params.email,
          given_name: params.givenName,
          family_name: params.familyName,
        },
      },
    });
    return {
      isSignUpComplete: result.isSignUpComplete,
      nextStep: result.nextStep ? { signUpStep: result.nextStep.signUpStep } : undefined,
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!isDemoMode) {
      await amplifySignOut();
    }
    setUser(null);
    setRole(null);
  }, []);

  const handleConfirmSignUp = useCallback(async (email: string, code: string) => {
    if (isDemoMode) return;
    await amplifyConfirmSignUp({ username: email, confirmationCode: code });
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    if (isDemoMode) return;
    await amplifyResetPassword({ username: email });
  }, []);

  const handleConfirmResetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      if (isDemoMode) return;
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    },
    [],
  );

  const value: AuthContextValue = {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    confirmSignUp: handleConfirmSignUp,
    resetPassword: handleResetPassword,
    confirmResetPassword: handleConfirmResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
