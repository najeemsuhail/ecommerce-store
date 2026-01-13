'use client';

import { useState } from 'react';
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
  const { groups, createGroup, addItemToGroup } = useWishlist();
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleAddToExistingGroup = (groupId: string) => {
    addItemToGroup(groupId, {
      productId,
      name: productName,
      price: productPrice,
      image: productImage,
      slug: productSlug,
    });
    setMessage('Added to collection!');
    setTimeout(() => {
      onClose();
      setMessage('');
      setNewGroupName('');
      setSelectedGroupId('');
    }, 1500);
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim());
      // Get the newly created group (it will be the last one)
      const newGroup = groups[groups.length];
      if (newGroup) {
        addItemToGroup(newGroup.id, {
          productId,
          name: productName,
          price: productPrice,
          image: productImage,
          slug: productSlug,
        });
      }
      setMessage('Added to new collection!');
      setTimeout(() => {
        onClose();
        setMessage('');
        setNewGroupName('');
        setSelectedGroupId('');
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add to Collection</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
              {message}
            </div>
          )}

          {/* Product Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-4">
            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{productName}</p>
              <p className="text-blue-600 font-bold">₹{productPrice}</p>
            </div>
          </div>

          {/* Existing Collections */}
          {groups.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Add to existing collection:</h3>
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleAddToExistingGroup(group.id)}
                    className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-600">
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
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
