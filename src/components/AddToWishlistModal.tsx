'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';

interface AddToWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  productSlug: string;
}

export default function AddToWishlistModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  productImage,
  productSlug,
}: AddToWishlistModalProps) {
  const { groups, isLoggedIn, isLoading, createGroup, addItemToGroup } = useWishlist();
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleAddToExistingGroup = async (groupId: string) => {
    await addItemToGroup(groupId, productId);
    setMessage('Added to collection!');
    setTimeout(() => {
      onClose();
      setMessage('');
      setNewGroupName('');
      setSelectedGroupId('');
    }, 1500);
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      await createGroup(newGroupName.trim());
      // After creating group, refetch to get the new group
      setTimeout(async () => {
        // Add to the first group (most recently created)
        if (groups.length > 0) {
          await addItemToGroup(groups[0].id, productId);
        }
      }, 500);
      setMessage('Added to new collection!');
      setTimeout(() => {
        onClose();
        setMessage('');
        setNewGroupName('');
        setSelectedGroupId('');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        {/* Login Modal */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-light-theme rounded-lg shadow-2xl z-50 w-full max-w-md mx-4">
          <div className="gradient-primary-accent p-6 text-white-theme flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <button
              onClick={onClose}
              className="text-white-theme hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 text-center">
            <p className="text-dark-theme mb-6">
              You need to sign in to save items to your wishlist.
            </p>
            <div className="flex gap-3">
              <Link
                href="/auth"
                className="flex-1 btn-primary-theme cursor-pointer"
              >
                Sign In
              </Link>
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-theme text-gray-theme px-4 py-2 rounded-lg hover-bg-gray-light font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-light-theme rounded-lg shadow-2xl z-50 w-full max-w-md mx-4">
        {/* Header */}
        <div className="gradient-primary-accent p-6 text-white-theme flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add to Collection</h2>
          <button
            onClick={onClose}
            className="text-white-theme hover:text-light-theme text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-success-light text-success-theme rounded-lg text-center font-medium">
              {message}
            </div>
          )}

          {/* Product Info */}
          <div className="mb-6 p-4 bg-light-gray-theme rounded-lg flex gap-4">
            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-dark-theme">{productName}</p>
              <p className="text-primary-theme font-bold">₹{productPrice}</p>
            </div>
          </div>

          {/* Existing Collections */}
          {groups.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-dark-theme mb-3">Add to existing collection:</h3>
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleAddToExistingGroup(group.id)}
                    className="w-full text-left p-3 border-2 border-gray-theme rounded-lg hover:border-primary-theme hover:bg-primary-light transition-all"
                  >
                    <p className="font-medium text-dark-theme">{group.name}</p>
                    <p className="text-sm text-light-theme">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New Collection */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Or create new collection:</h3>
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="Collection name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="btn-primary-theme text-sm cursor-pointer"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
