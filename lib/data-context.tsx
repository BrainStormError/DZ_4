'use client';

import React, { createContext, useContext } from 'react';
import { useDataStore, type DataStore } from './data-store';

const DataContext = createContext<DataStore | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const store = useDataStore();
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
