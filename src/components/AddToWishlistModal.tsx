'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/lib/currency';

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
}: AddToWishlistModalProps) {
  const { groups, isLoggedIn, createGroup, addItemToGroup } = useWishlist();
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setNewGroupName('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const handleAddToExistingGroup = async (groupId: string) => {
    setIsSubmitting(true);
    setError('');
    const success = await addItemToGroup(groupId, productId);
    setIsSubmitting(false);

    if (success) {
      handleClose();
      return;
    }

    setError('Failed to add item to collection.');
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setError('Collection name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const createdGroup = await createGroup(trimmedName);
    if (!createdGroup) {
      setIsSubmitting(false);
      setError('Failed to create collection.');
      return;
    }

    const success = await addItemToGroup(createdGroup.id, productId);
    setIsSubmitting(false);

    if (success) {
      handleClose();
      return;
    }

    setError('Collection created, but adding the item failed.');
  };

  if (!isOpen) return null;

  if (!isLoggedIn) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={handleClose}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        <div className="fixed inset-x-4 bottom-4 z-50 md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2">
          <div className="overflow-hidden rounded-2xl bg-light-theme shadow-2xl">
            <div className="gradient-primary-accent flex items-center justify-between p-4 text-white-theme md:p-6">
              <h2 className="text-xl font-bold md:text-2xl">Sign In Required</h2>
              <button onClick={handleClose} className="text-2xl text-white-theme hover:text-gray-200">
                x
              </button>
            </div>

            <div className="p-4 text-center md:p-6">
              <p className="mb-6 text-sm text-dark-theme md:text-base">
                You need to sign in to save items to your wishlist.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link href="/auth" className="flex-1 cursor-pointer text-center btn-primary-theme">
                  Sign In
                </Link>
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-lg border-2 border-gray-theme px-4 py-2 font-medium text-gray-theme transition-colors hover:bg-light-gray-theme"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-x-4 md:bottom-4 md:flex md:items-center md:justify-center">
        <div className="w-full md:max-w-md">
          <div className="max-h-[88vh] overflow-hidden rounded-t-3xl bg-light-theme shadow-2xl md:rounded-2xl">
            <div className="gradient-primary-accent flex items-center justify-between p-4 text-white-theme md:p-6">
              <h2 className="text-xl font-bold md:text-2xl">Add to Collection</h2>
              <button onClick={handleClose} className="text-2xl text-white-theme hover:text-light-theme">
                x
              </button>
            </div>

            <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-4 md:p-6">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-6 flex gap-3 rounded-xl bg-light-gray-theme p-3 md:p-4">
                {productImage && (
                  <div className="relative h-16 w-16 overflow-hidden rounded md:h-20 md:w-20">
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium text-dark-theme">{productName}</p>
                  <p className="font-bold text-primary-theme">{formatPrice(productPrice)}</p>
                </div>
              </div>

              {groups.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 font-bold text-dark-theme">Add to existing collection:</h3>
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleAddToExistingGroup(group.id)}
                        disabled={isSubmitting}
                        className="w-full rounded-xl border-2 border-gray-theme p-3 text-left transition-all hover:border-primary-theme hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <p className="font-medium text-dark-theme">{group.name}</p>
                        <p className="text-sm text-slate-500">
                          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 font-bold text-gray-900">Or create new collection:</h3>
                <form onSubmit={handleCreateAndAdd} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Collection name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-theme cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving...' : 'Create'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
