'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import type { User } from './types';

interface AuthState {
  user: User | null;
  login: () => Promise<void>;
  loginAsDemo: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface ExtendedSession {
  userId?: string;
  user?: { email?: string | null };
  fullName?: string;
  role?: User['role'];
  avatarUrl?: string;
  birthDate?: string;
  department?: string;
  googleSub?: string | null;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' };

  const login = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  const loginAsDemo = async (email: string) => {
    await signIn('demo', { email, callbackUrl: '/' });
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return { user: null, login, loginAsDemo, logout };
  }

  const email = session?.user?.email?.trim().toLowerCase() || undefined;

  if (!session?.userId || !email) {
    return { user: null, login, loginAsDemo, logout };
  }

  const user: User = {
    id: session.userId,
    email,
    fullName: session.fullName ?? '',
    role: session.role ?? 'employee',
    avatarUrl: session.avatarUrl ?? '',
    birthDate: session.birthDate ?? '',
    department: session.department ?? '',
    googleSub: session.googleSub ?? null,
  };

  return { user, login, loginAsDemo, logout };
}