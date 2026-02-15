'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Failed to load recently viewed products:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const addToRecentlyViewed = (product: RecentlyViewedProduct) => {
    if (!isClient) return;

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
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recently viewed products:', error);
    }
  };

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
