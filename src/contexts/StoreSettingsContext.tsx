'use client';

import { createContext, useContext } from 'react';
import type { PublicStoreSettings } from '@/lib/storeSettings';

const StoreSettingsContext = createContext<PublicStoreSettings | null>(null);

interface StoreSettingsProviderProps {
  children: React.ReactNode;
  value: PublicStoreSettings;
}

export function StoreSettingsProvider({ children, value }: StoreSettingsProviderProps) {
  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);

  if (!context) {
    throw new Error('useStoreSettings must be used within StoreSettingsProvider');
  }

  return context;
}
