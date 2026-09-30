'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { signIn, signOut } from 'next-auth/react';
import type { User } from './types';

interface AuthState {
  user: User | null;
  login: () => Promise<void>;
  loginAsDemo: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  const login = useCallback(async () => {
    await signIn('google', { callbackUrl: '/' });
  }, []);

  const loginAsDemo = useCallback(async (email: string) => {
    await signIn('demo', { email, callbackUrl: '/' });
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await signOut({ callbackUrl: '/login' });
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, login, loginAsDemo, logout }),
    [user, login, loginAsDemo, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
