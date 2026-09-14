'use client';

import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

interface DateState {
  today: Date;
  isPreview: boolean;
  previewDate: Date | null;
  setPreviewDate: (date: Date | null) => void;
  resetDate: () => void;
}

const DateContext = createContext<DateState | undefined>(undefined);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const STABLE_INITIAL_TODAY = new Date(2000, 0, 1);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [realToday, setRealToday] = useState<Date>(STABLE_INITIAL_TODAY);
  const [previewDate, setPreviewDateState] = useState<Date | null>(null);

  useEffect(() => {
    setRealToday(startOfDay(new Date()));
  }, []);

  const setPreviewDate = useCallback((date: Date | null) => {
    setPreviewDateState(date ? startOfDay(date) : null);
  }, []);

  const resetDate = useCallback(() => setPreviewDateState(null), []);

  const value = useMemo<DateState>(
    () => ({
      today: previewDate ?? realToday,
      isPreview: previewDate !== null,
      previewDate,
      setPreviewDate,
      resetDate,
    }),
    [previewDate, realToday, setPreviewDate, resetDate]
  );

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useAppDate() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error('useAppDate must be used within DateProvider');
  return ctx;
}
