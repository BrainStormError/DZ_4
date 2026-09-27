'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from './types';

interface DirectoryState {
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

const DirectoryContext = createContext<DirectoryState | undefined>(undefined);

export function DirectoryProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Не удалось загрузить список сотрудников');
        }
        const data = (await response.json()) as User[];
        if (!cancelled) {
          setUsers(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<DirectoryState>(
    () => ({ users, isLoading, error }),
    [users, isLoading, error]
  );

  return (
    <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>
  );
}

export function useDirectory() {
  const ctx = useContext(DirectoryContext);
  if (!ctx) throw new Error('useDirectory must be used within DirectoryProvider');
  return ctx;
}
