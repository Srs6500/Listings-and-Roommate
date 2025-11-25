'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import scrapedProperties from '@/lib/scraped-properties.json';

interface AdminUser {
  email: string;
  role: 'admin';
  permissions: string[];
  createdAt: string;
}

interface RemovedProperty {
  id: string;
  title: string;
  removedBy: string;
  reason: string;
  removedAt: string;
  originalData: any;
}

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  removedProperties: RemovedProperty[];
  removeProperty: (propertyId: string, reason: string) => Promise<void>;
  restoreProperty: (propertyId: string) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  createAdminAccount: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [removedProperties, setRemovedProperties] = useState<RemovedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin from Supabase users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_admin, email')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (userData?.is_admin) {
          // User is admin - create AdminUser object
          const adminData: AdminUser = {
            email: userData.email || user.email || '',
            role: 'admin',
            permissions: ['remove_properties', 'view_removed_properties', 'restore_properties'],
            createdAt: new Date().toISOString()
          };
          
          setAdminUser(adminData);
          setIsAdmin(true);
          
          // Load removed properties
          await loadRemovedProperties();
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const loadRemovedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('removed_properties')
        .select('*')
        .order('removed_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const removed = data.map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          removedBy: prop.removed_by,
          reason: prop.reason,
          removedAt: prop.removed_at,
          originalData: prop.original_data
        })) as RemovedProperty[];
        
        setRemovedProperties(removed);
      }
    } catch (error) {
      console.error('Error loading removed properties:', error);
    }
  };

  const removeProperty = async (propertyId: string, reason: string) => {
    if (!isAdmin || !user?.id) return;

    try {
      // Find the property in our scraped properties
      const propertyToRemove = scrapedProperties.find(p => p.id === propertyId);
      if (!propertyToRemove) return;

      // Store in removed properties table
      const removedPropertyData = {
        id: propertyId,
        title: propertyToRemove.title || 'Unknown Property',
        removed_by: user.id,
        reason: reason,
        removed_at: new Date().toISOString(),
        original_data: propertyToRemove
      };

      const { error } = await supabase
        .from('removed_properties')
        .upsert(removedPropertyData);

      if (error) {
        throw error;
      }

      // Update local state
      setRemovedProperties(prev => [...prev, {
        id: propertyId,
        title: removedPropertyData.title,
        removedBy: user.id,
        reason: removedPropertyData.reason,
        removedAt: removedPropertyData.removed_at,
        originalData: removedPropertyData.original_data
      }]);
      
    } catch (error) {
      console.error('Error removing property:', error);
      throw error;
    }
  };

  const restoreProperty = async (propertyId: string) => {
    if (!isAdmin) return;

    try {
      // Delete from removed properties table
      const { error } = await supabase
        .from('removed_properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw error;
      }

      // Update local state
      setRemovedProperties(prev => prev.filter(p => p.id !== propertyId));
      
    } catch (error) {
      console.error('Error restoring property:', error);
      throw error;
    }
  };

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to sign in');
      }
      
      // Check if user is admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin, email')
        .eq('id', authData.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!userData?.is_admin) {
        throw new Error('User is not an admin');
      }

      const adminData: AdminUser = {
        email: userData.email || email,
        role: 'admin',
        permissions: ['remove_properties', 'view_removed_properties', 'restore_properties'],
        createdAt: new Date().toISOString()
      };
      
      setAdminUser(adminData);
      setIsAdmin(true);
      
      // Load removed properties
      await loadRemovedProperties();
      
    } catch (error) {
      console.error('Error logging in as admin:', error);
      throw error;
    }
  };

  const createAdminAccount = async (email: string, password: string) => {
    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Update user to be admin in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', authData.user.id);
      
      if (updateError) {
        throw updateError;
      }

      const adminData: AdminUser = {
        email: email,
        role: 'admin',
        permissions: ['remove_properties', 'view_removed_properties', 'restore_properties'],
        createdAt: new Date().toISOString()
      };
      
      setAdminUser(adminData);
      setIsAdmin(true);
      
    } catch (error) {
      console.error('Error creating admin account:', error);
      throw error;
    }
  };

  const value = {
    isAdmin,
    adminUser,
    removedProperties,
    removeProperty,
    restoreProperty,
    loginAsAdmin,
    createAdminAccount,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

