'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      loadAddresses();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadAddresses = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setAddresses(user.address || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    let newAddresses = [...addresses];

    if (editingIndex !== null) {
      // Update existing address
      newAddresses[editingIndex] = formData;
    } else {
      // Add new address
      if (formData.isDefault) {
        // Remove default from others
        newAddresses = newAddresses.map((addr) => ({ ...addr, isDefault: false }));
      }
      newAddresses.push(formData);
    }

    try {
      const response = await fetch('/api/auth/update-addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: newAddresses }),
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(newAddresses);
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.address = newAddresses;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Reset form
        setFormData({
          name: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
        setShowForm(false);
        setEditingIndex(null);
      }
    } catch (error) {
      console.error('Failed to save address');
    }
  };

  const handleEdit = (index: number) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Delete this address?')) return;

    const token = localStorage.getItem('token');
    const newAddresses = addresses.filter((_, i) => i !== index);

    try {
      const response = await fetch('/api/auth/update-addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: newAddresses }),
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(newAddresses);
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.address = newAddresses;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Failed to delete address');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="theme-surface p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Saved Addresses</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="theme-cta-primary"
              >
                + Add New Address
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="theme-surface theme-surface-accent mb-6 p-6">
              <h3 className="font-bold text-lg mb-4">
                {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="theme-form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="theme-form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="theme-form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="theme-form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="theme-form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="theme-form-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="theme-check w-4 h-4"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default address
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="theme-cta-primary"
                  >
                    {editingIndex !== null ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="theme-cta-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length === 0 ? (
            <div className="text-center py-12 text-text-lighter">
              <p className="mb-4">No saved addresses</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="theme-cta-primary"
                >
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className={`theme-option-card p-4 ${
                    address.isDefault ? 'theme-option-card-active' : ''
                  }`}
                >
                  {address.isDefault && (
                    <span className="btn-xs-primary text-white-theme mb-2">
                      Default
                    </span>
                  )}
                  <p className="font-semibold">{address.name}</p>
                  <p className="theme-info-note text-sm">{address.phone}</p>
                  <p className="text-sm text-gray-theme mt-2">{address.address}</p>
                  <p className="text-sm text-gray-theme">
                    {address.city}, {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-theme">{address.country}</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(index)}
                      className="theme-button-primary flex-1 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="theme-button-secondary px-4 py-2 text-sm theme-wishlist-active"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
