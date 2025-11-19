'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { isAdmin, adminUser, removedProperties, removeProperty, restoreProperty, loading } = useAdmin();
  const { user } = useAuth();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [removeReason, setRemoveReason] = useState('');

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have admin privileges.</p>
        <p className="text-sm text-gray-500 mt-2">
          Current email: {user?.email}
        </p>
      </div>
    );
  }

  const handleRemoveProperty = async () => {
    if (!selectedProperty || !removeReason.trim()) return;

    try {
      await removeProperty(selectedProperty.id, removeReason);
      setShowRemoveModal(false);
      setSelectedProperty(null);
      setRemoveReason('');
    } catch (error) {
      console.error('Error removing property:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-red-100">
          Welcome, {adminUser?.email} | Role: {adminUser?.role}
        </p>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Property Management</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowRemoveModal(true)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Property
            </button>
            <p className="text-sm text-gray-600">
              Remove properties from the feed with a reason
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Removed Properties:</span>
              <span className="font-semibold text-red-600">{removedProperties.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Email:</span>
              <span className="font-semibold text-blue-600">{adminUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Properties List */}
      {removedProperties.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Removed Properties</h3>
          <div className="space-y-3">
            {removedProperties.map((property) => (
              <div key={property.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">Removed by: {property.removedBy}</p>
                    <p className="text-sm text-gray-600">Reason: {property.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(property.removedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreProperty(property.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Property Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Remove Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property ID
                </label>
                <input
                  type="text"
                  value={selectedProperty?.id || ''}
                  onChange={(e) => setSelectedProperty({ id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter property ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Removal Reason
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Enter reason for removal..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveProperty}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
