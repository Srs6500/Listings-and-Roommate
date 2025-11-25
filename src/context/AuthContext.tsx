'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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
    // Add timeout to prevent infinite loading
    // If Supabase session check takes longer than 3 seconds, render app anyway
    // This prevents black screen issues if Supabase is slow or unreachable
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Session check timeout - rendering app anyway');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error getting session:', error);
          // Still set loading to false so app can render
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          localStorage.setItem('currentUser', session.user.id);
          checkAdminStatus(session.user.id).catch(err => {
            console.error('Error checking admin status:', err);
          });
        } else {
          localStorage.removeItem('currentUser');
          setIsAdmin(false);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Critical error getting session:', error);
        // Set loading to false anyway so app can render
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        localStorage.setItem('currentUser', session.user.id);
        await checkAdminStatus(session.user.id).catch(err => {
          console.error('Error checking admin status:', err);
        });
      } else {
        localStorage.removeItem('currentUser');
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        // Fallback to email check
        const { data: userData } = await supabase.auth.getUser();
        setIsAdmin(userData?.user?.email === 'admin@loyveil.edu');
        return;
      }

      setIsAdmin(data?.is_admin || data?.email === 'admin@loyveil.edu');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear state immediately (don't wait for Supabase)
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('walletConnectedUser');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
      clearLoginAttemptData();
      
      // Try to sign out from Supabase (non-blocking)
      signOutUser().catch(err => {
        console.log('Supabase sign out (background):', err);
      });
      
      console.log('✅ User signed out immediately');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear state even on error
      setUser(null);
      setIsAdmin(false);
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
