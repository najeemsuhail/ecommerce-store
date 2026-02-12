'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faTimes,
  faList,
} from '@fortawesome/free-solid-svg-icons';

interface DeliveryPinCode {
  pinCode: string;
  type: string; // 'cod' or 'prepaid'
}

interface FormState {
  pinCode: string;
  type: string;
}

const INITIAL_FORM_STATE: FormState = {
  pinCode: '',
  type: 'prepaid',
};

export default function DeliveryManagementPage() {
  const [records, setRecords] = useState<DeliveryPinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'pinCode' | 'type'>('pinCode');

  // Fetch records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/delivery-pin-codes');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.pinCode || !formData.type) {
      setError('Please fill in all required fields');
      return;
    }

    if (!['cod', 'prepaid'].includes(formData.type)) {
      setError('Type must be either "cod" or "prepaid"');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/delivery-pin-codes/${editingId}`
        : '/api/admin/delivery-pin-codes';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save record');
      }

      const data = await response.json();
      setSuccess(data.message || 'Record saved successfully');
      setFormData(INITIAL_FORM_STATE);
      setEditingId(null);
      setShowForm(false);
      await fetchRecords();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (record: DeliveryPinCode) => {
    setFormData({
      pinCode: record.pinCode,
      type: record.type,
    });
    setEditingId(record.pinCode + '|' + record.type);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setError('');
      const [pinCode, type] = id.split('|');
      
      const response = await fetch(`/api/admin/delivery-pin-codes/${encodeURIComponent(pinCode + '|' + type)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete record');
      }

      setSuccess('Record deleted successfully');
      setDeleteConfirm(null);
      await fetchRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setError('');
    setSuccess('');
  };

  // Filter and sort records
  let filteredRecords = records;
  if (filterType) {
    filteredRecords = filteredRecords.filter((r) => r.type.toLowerCase().includes(filterType.toLowerCase()));
  }

  filteredRecords.sort((a, b) => {
    if (sortBy === 'pinCode') return a.pinCode.localeCompare(b.pinCode);
    return a.type.localeCompare(b.type);
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Delivery PIN Code Management</h1>
          <p className="text-gray-400">Manage delivery areas, payment methods, and delivery timelines</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Alert Messages */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-300 hover:text-red-200">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-300 hover:text-green-200">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit PIN Code' : 'Add New PIN Code'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PIN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PIN Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    disabled={editingId !== null}
                    placeholder="e.g., 110001"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Type --</option>
                    <option value="prepaid">💳 Prepaid</option>
                    <option value="cod">📦 Cash on Delivery</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-slate-700">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCheckCircle} />}
                  {submitting ? 'Saving...' : 'Save PIN Code'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-300 border border-slate-600 rounded-lg font-semibold hover:border-slate-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData(INITIAL_FORM_STATE);
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New PIN Code
          </button>
        )}

        {/* Filters */}
        {!showForm && (
          <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faList} />
              Filters & Sorting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Filter by Type..."
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'pinCode' | 'type')}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pinCode">Sort by PIN Code</option>
                <option value="type">Sort by Type</option>
              </select>
              <div className="text-gray-300 flex items-center justify-center text-sm">
                Showing {filteredRecords.length} of {records.length} records
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {!showForm && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">PIN Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.pinCode + record.type} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-white font-mono font-semibold">{record.pinCode}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        record.type === 'prepaid'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {record.type === 'prepaid' ? '💳 Prepaid' : '📦 COD'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => {
                          setFormData({
                            pinCode: record.pinCode,
                            type: record.type,
                          });
                          setEditingId(record.pinCode + record.type);
                          setShowForm(true);
                          setError('');
                          setSuccess('');
                        }}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(record.pinCode + '|' + record.type)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p>No records found. {filterState || filterCity ? 'Try adjusting your filters.' : 'Create your first PIN code.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-3xl" />
            <p className="text-gray-400 mt-3">Loading records...</p>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-3">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this PIN code? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
