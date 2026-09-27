'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User } from './types';
import { clearAuthCookie, writeAuthCookie } from './auth-cookie';

interface AuthState {
  user: User | null;
  login: (email: string) => Promise<{ ok: boolean; error?: string }>;
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

  const login = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        user?: User;
        error?: string;
      };
      if (!data.ok || !data.user) {
        return { ok: false, error: data.error || 'Ошибка входа' };
      }
      setUser(data.user);
      writeAuthCookie(data.user.email);
      dropLegacySession();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Не удалось выполнить вход. Попробуйте ещё раз.' };
    }
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
