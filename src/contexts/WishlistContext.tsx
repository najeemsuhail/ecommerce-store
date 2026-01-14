'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
  createGroup: (groupName: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  renameGroup: (groupId: string, newName: string) => Promise<void>;
  addItemToGroup: (groupId: string, item: WishlistItem) => Promise<void>;
  removeItemFromGroup: (groupId: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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
      setIsLoading(true);
      const response = await fetch('/api/wishlist/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
        setIsLoggedIn(true);
        setError(null);
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

  const createGroup = useCallback(async (groupName: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
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
        await refreshWishlist();
      } else {
        setError('Failed to create group');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      setError('Failed to create group');
    }
  }, [getToken, refreshWishlist]);

  const deleteGroup = useCallback(async (groupId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGroups(groups.filter((group) => group.id !== groupId));
      } else {
        setError('Failed to delete group');
      }
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError('Failed to delete group');
    }
  }, [getToken, groups]);

  const renameGroup = useCallback(async (groupId: string, newName: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
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
        setGroups(
          groups.map((group) =>
            group.id === groupId ? { ...group, name: newName } : group
          )
        );
      } else {
        setError('Failed to rename group');
      }
    } catch (err) {
      console.error('Failed to rename group:', err);
      setError('Failed to rename group');
    }
  }, [getToken, groups]);

  const addItemToGroup = useCallback(async (groupId: string, item: WishlistItem) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/groups/${groupId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.productId }),
      });

      if (response.ok) {
        await refreshWishlist();
      } else {
        setError('Failed to add item');
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item');
    }
  }, [getToken, refreshWishlist]);

  const removeItemFromGroup = useCallback(async (groupId: string, productId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not logged in');
      return;
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
        setGroups(
          groups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                items: group.items.filter((item) => item.productId !== productId),
              };
            }
            return group;
          })
        );
      } else {
        setError('Failed to remove item');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
    }
  }, [getToken, groups]);

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
