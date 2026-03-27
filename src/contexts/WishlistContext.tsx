'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getClientCache, setClientCache } from '@/lib/clientCache';

export interface WishlistItem {
  id: string;
  productId: string;
  groupId: string;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
}

export interface WishlistGroup {
  id: string;
  name: string;
  userId: string;
  items: WishlistItem[];
  createdAt?: Date;
}

interface WishlistContextType {
  groups: WishlistGroup[];
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  createGroup: (groupName: string) => Promise<WishlistGroup | null>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  renameGroup: (groupId: string, newName: string) => Promise<boolean>;
  addItemToGroup: (groupId: string, productId: string) => Promise<boolean>;
  removeItemFromGroup: (groupId: string, productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_CACHE_TTL_MS = 60 * 1000;

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<WishlistGroup[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getToken = useCallback(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }, []);

  const getWishlistCacheKey = useCallback((token: string) => {
    const tokenSuffix = token.slice(-16);
    return `wishlist:groups:${tokenSuffix}`;
  }, []);

  // Fetch wishlist from API
  const refreshWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setGroups([]);
      setIsLoading(false);
      return;
    }

    try {
      const cacheKey = getWishlistCacheKey(token);
      const cachedGroups = getClientCache<WishlistGroup[]>(cacheKey);
      if (cachedGroups) {
        setGroups(cachedGroups);
        setIsLoggedIn(true);
        setError(null);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      const response = await fetch('/api/wishlist/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const nextGroups = data.groups || [];
        setGroups(nextGroups);
        setIsLoggedIn(true);
        setError(null);
        setClientCache(cacheKey, nextGroups, WISHLIST_CACHE_TTL_MS);
      } else if (response.status === 401) {
        // Unauthorized - clear local data
        setIsLoggedIn(false);
        setGroups([]);
        setError('Session expired - please login again');
        // Clear the token
        localStorage.removeItem('token');
      } else {
        setIsLoggedIn(false);
        setGroups([]);
        setError('Failed to load wishlist');
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError('Failed to load wishlist');
      setIsLoggedIn(false);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Check auth on mount and listen for storage changes
  useEffect(() => {
    refreshWishlist();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      refreshWishlist();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshWishlist]);

  // Also watch for token changes in localStorage
  useEffect(() => {
    let previousToken = getToken();

    const checkTokenChange = () => {
      const currentToken = getToken();
      
      if (!currentToken && previousToken) {
        // Token was removed (user logged out)
        setGroups([]);
        setIsLoggedIn(false);
      } else if (currentToken && !previousToken) {
        // Token was added (user logged in) - refresh wishlist data
        refreshWishlist();
      }
      
      previousToken = currentToken;
    };

    // Check on mount
    checkTokenChange();

    // Set up interval to check for token changes
    const interval = setInterval(checkTokenChange, 500);
    return () => clearInterval(interval);
  }, [getToken, refreshWishlist]);

  const createGroup = useCallback(async (groupName: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return null;
    }

    try {
      const response = await fetch('/api/wishlist/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      if (response.ok) {
        const data = await response.json();
        const createdGroup = data.group as WishlistGroup;
        setGroups((prev) => [createdGroup, ...prev]);
        setError(null);
        return createdGroup;
      } else {
        setError('Failed to create group');
        return null;
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      setError('Failed to create group');
      return null;
    }
  }, [getToken, getWishlistCacheKey]);

  const deleteGroup = useCallback(async (groupId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return false;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGroups((prev) => prev.filter((group) => group.id !== groupId));
        setError(null);
        return true;
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to delete group');
        return false;
      }
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError('Failed to delete group');
      return false;
    }
  }, [getToken, getWishlistCacheKey]);

  const renameGroup = useCallback(async (groupId: string, newName: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return false;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId ? { ...group, name: newName } : group
          )
        );
        setError(null);
        return true;
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to rename group');
        return false;
      }
    } catch (err) {
      console.error('Failed to rename group:', err);
      setError('Failed to rename group');
      return false;
    }
  }, [getToken]);

  const addItemToGroup = useCallback(async (groupId: string, productId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return false;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        await refreshWishlist();
        setError(null);
        return true;
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to add item');
        return false;
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
      return false;
    }
  }, [getToken, refreshWishlist]);

  const removeItemFromGroup = useCallback(async (groupId: string, productId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return false;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setGroups((prev) =>
          prev.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                items: group.items.filter((item) => item.productId !== productId),
              };
            }
            return group;
          })
        );
        setError(null);
        return true;
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Failed to remove item');
        return false;
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
      return false;
    }
  }, [getToken]);

  const isInWishlist = (productId: string) => {
    return groups.some((group) =>
      group.items.some((item) => item.productId === productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        groups,
        isLoggedIn,
        isLoading,
        error,
        createGroup,
        deleteGroup,
        renameGroup,
        addItemToGroup,
        removeItemFromGroup,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
