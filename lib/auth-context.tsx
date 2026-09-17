'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User } from './types';
import { checkCorpEmail } from './corp-email';
import { clearAuthCookie, writeAuthCookie } from './auth-cookie';

interface AuthState {
  user: User | null;
  login: (email: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'corp-gift-auth-email';

function dropLegacySession() {
  if (typeof window !== 'undefined') localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  const login = useCallback((email: string) => {
    const result = checkCorpEmail(email);
    if (!result.ok || !result.user) {
      return { ok: false, error: result.error };
    }
    setUser(result.user);
    writeAuthCookie(result.user.email);
    dropLegacySession();
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthCookie();
    dropLegacySession();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, login, logout }),
    [user, login, logout]
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
