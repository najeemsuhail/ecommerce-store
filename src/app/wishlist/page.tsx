'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useWishlist } from '@/contexts/WishlistContext';

export default function WishlistPage() {
  const { groups, createGroup, deleteGroup, renameGroup, removeItemFromGroup } = useWishlist();
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleRenameGroup = (groupId: string, currentName: string) => {
    setRenamingGroupId(groupId);
    setRenameText(currentName);
  };

  const handleSaveRename = (groupId: string) => {
    if (renameText.trim()) {
      renameGroup(groupId, renameText.trim());
      setRenamingGroupId(null);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Sign In Required</h2>
            <p className="text-gray-600 mb-6">You need to sign in to view your wishlist collections.</p>
            <Link
              href="/auth"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-600">Organize your favorite products into collections</p>
          </div>

          {/* Create Group Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Collection</h2>
            <form onSubmit={handleCreateGroup} className="flex gap-3">
              <input
                type="text"
                placeholder="Collection name (e.g., Birthday Gifts, Home Decor)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Create Collection
              </button>
            </form>
          </div>

          {/* Collections */}
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-gray-800">No collections yet</h3>
              <p className="text-gray-600">Create your first collection to start saving items</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                    {renamingGroupId === group.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={renameText}
                          onChange={(e) => setRenameText(e.target.value)}
                          className="flex-1 px-2 py-1 rounded text-gray-900 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(group.id)}
                          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold">{group.name}</h3>
                          <p className="text-blue-100 text-sm">
                            {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRenameGroup(group.id, group.name)}
                          className="text-blue-100 hover:text-white text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  {group.items.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-sm">No items in this collection</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {group.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          {/* Item Image */}
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="block font-medium text-gray-900 hover:text-blue-600 truncate"
                            >
                              {item.name}
                            </Link>
                            <p className="text-blue-600 font-bold">₹{item.price}</p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItemFromGroup(group.id, item.productId)}
                            className="text-red-500 hover:text-red-700 font-bold p-1"
                            title="Remove from collection"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delete Collection Button */}
                  <div className="border-t p-4">
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="w-full text-red-600 hover:text-red-700 py-2 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete Collection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping */}
          {groups.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/products"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
