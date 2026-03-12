'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  viewedAt: number;
  isDigital?: boolean;
  weight?: number;
  isActive?: boolean;
}

interface RecentlyViewedContextType {
  recentlyViewed: RecentlyViewedProduct[];
  addToRecentlyViewed: (product: RecentlyViewedProduct) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

function getInitialRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load recently viewed products:', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>(getInitialRecentlyViewed);

  const addToRecentlyViewed = useCallback((product: RecentlyViewedProduct) => {
    if (typeof window === 'undefined') return;

    setRecentlyViewed((prev) => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter((p) => p.id !== product.id);

      // Add new product with current timestamp
      const updated = [
        {
          ...product,
          viewedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently viewed products:', error);
      }

      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recently viewed products:', error);
    }
  }, []);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
}
