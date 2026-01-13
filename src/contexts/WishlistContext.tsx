'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

export interface WishlistGroup {
  id: string;
  name: string;
  items: WishlistItem[];
  createdAt: Date;
}

interface WishlistContextType {
  groups: WishlistGroup[];
  createGroup: (groupName: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;
  addItemToGroup: (groupId: string, item: WishlistItem) => void;
  removeItemFromGroup: (groupId: string, productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<WishlistGroup[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setGroups(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(groups));
  }, [groups]);

  const createGroup = (groupName: string) => {
    const newGroup: WishlistGroup = {
      id: Date.now().toString(),
      name: groupName,
      items: [],
      createdAt: new Date(),
    };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  const renameGroup = (groupId: string, newName: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };

  const addItemToGroup = (groupId: string, item: WishlistItem) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          // Check if item already exists
          const itemExists = group.items.some(
            (existingItem) => existingItem.productId === item.productId
          );
          if (!itemExists) {
            return { ...group, items: [...group.items, item] };
          }
        }
        return group;
      })
    );
  };

  const removeItemFromGroup = (groupId: string, productId: string) => {
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
  };

  const isInWishlist = (productId: string) => {
    return groups.some((group) =>
      group.items.some((item) => item.productId === productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        groups,
        createGroup,
        deleteGroup,
        renameGroup,
        addItemToGroup,
        removeItemFromGroup,
        isInWishlist,
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
