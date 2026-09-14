'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeKey } from './types';
import { DEFAULT_THEME } from './theme';

interface ThemeState {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

const STORAGE_KEY = 'corp-gift-theme';

function isThemeKey(value: string | null): value is ThemeKey {
  return value === 'warm' || value === 'festival' || value === 'premium';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    const resolved = isThemeKey(attr) ? attr : DEFAULT_THEME;
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const setTheme = useCallback((t: ThemeKey) => {
    setThemeState(t);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
