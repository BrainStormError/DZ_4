'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from './types';
import { checkCorpEmail } from './corp-email';

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'corp-gift-auth-email';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const result = checkCorpEmail(stored);
      if (result.ok && result.user) setUser(result.user);
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string) => {
    const result = checkCorpEmail(email);
    if (!result.ok || !result.user) {
      return { ok: false, error: result.error };
    }
    setUser(result.user);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, result.user.email);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
