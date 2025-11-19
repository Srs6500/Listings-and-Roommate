'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { signOutUser, clearLoginAttemptData } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Store current user ID for Web3 context
      if (user) {
        localStorage.setItem('currentUser', user.uid);
      } else {
        localStorage.removeItem('currentUser');
      }
      
      // Check if user is admin
      if (user?.email === 'admin@loyveil.edu') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signOut = async () => {
    try {
      await signOutUser();
      // Clear user-specific data and disconnect wallet for security
      localStorage.removeItem('currentUser');
      localStorage.removeItem('walletConnectedUser');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
      // Clear login attempt data to reset counter for next session
      clearLoginAttemptData();
      // Ensure user state is cleared after sign out
      setUser(null);
      console.log('✅ User signed out, wallet disconnected for security');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
