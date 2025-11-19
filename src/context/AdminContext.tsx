'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
      if (!user?.email) {
        setIsAdmin(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', user.email));
        
        if (adminDoc.exists()) {
          const adminData = adminDoc.data() as AdminUser;
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
      const removedQuery = query(collection(db, 'removedProperties'));
      const snapshot = await getDocs(removedQuery);
      const removed = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RemovedProperty[];
      
      setRemovedProperties(removed);
    } catch (error) {
      console.error('Error loading removed properties:', error);
    }
  };

  const removeProperty = async (propertyId: string, reason: string) => {
    if (!isAdmin || !user?.email) return;

    try {
      // Find the property in our scraped properties
      const propertyToRemove = scrapedProperties.find(p => p.id === propertyId);
      if (!propertyToRemove) return;

      // Store in removed properties collection
      const removedPropertyData: Omit<RemovedProperty, 'id'> = {
        title: propertyToRemove.title || 'Unknown Property',
        removedBy: user.email,
        reason: reason,
        removedAt: new Date().toISOString(),
        originalData: propertyToRemove
      };

      await updateDoc(doc(db, 'removedProperties', propertyId), removedPropertyData);

      // Update local state
      setRemovedProperties(prev => [...prev, { id: propertyId, ...removedPropertyData }]);

      // Remove from active listings (you might want to implement this differently)
      // For now, we'll just mark it as removed in the database
      
    } catch (error) {
      console.error('Error removing property:', error);
      throw error;
    }
  };

  const restoreProperty = async (propertyId: string) => {
    if (!isAdmin) return;

    try {
      // Remove from removed properties collection
      await updateDoc(doc(db, 'removedProperties', propertyId), {
        restored: true,
        restoredAt: new Date().toISOString()
      });

      // Update local state
      setRemovedProperties(prev => prev.filter(p => p.id !== propertyId));
      
    } catch (error) {
      console.error('Error restoring property:', error);
      throw error;
    }
  };

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin
      const adminDoc = await getDoc(doc(db, 'admins', email));
      
      if (!adminDoc.exists()) {
        throw new Error('User is not an admin');
      }

      const adminData = adminDoc.data() as AdminUser;
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
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create admin document in Firestore
      const adminData: AdminUser = {
        email: email,
        role: 'admin',
        permissions: ['remove_properties', 'view_removed_properties', 'restore_properties'],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'admins', email), adminData);
      
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

// Import scraped properties directly
import scrapedProperties from '@/lib/scraped-properties.json';
