'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

interface AdminLoginProps {
  onSuccess?: () => void;
  className?: string;
}

export default function AdminLogin({ onSuccess, className = '' }: AdminLoginProps) {
  const { loginAsAdmin, createAdminAccount } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAsAdmin(email, password);
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createAdminAccount(email, password);
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Admin Login
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={isCreating ? handleCreateAdmin : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@loyveil.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : (isCreating ? 'Create Admin Account' : 'Login as Admin')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isCreating ? 'Already have an admin account? Login' : 'Need to create admin account?'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin Setup:</h3>
          <p className="text-xs text-gray-600">
            Email: <code className="bg-gray-200 px-1 rounded">admin@loyveil.com</code>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Use the "Create Admin Account" option to set up the admin account.
          </p>
        </div>
      </div>
    </div>
  );
}
