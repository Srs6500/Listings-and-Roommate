import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Extend the User type to include the id field
declare module 'next-auth' {
  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
  
  interface Session {
    user?: User;
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth environment variables');
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to the token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in - create/update user in Firestore
      if (account?.provider === 'google' && user?.email) {
        try {
          console.log('🔍 Google OAuth sign in for:', user.email);
          
          // Check if user document exists in Firestore
          const userDocRef = doc(db, 'users', user.id || '');
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create new user document for Google OAuth user
            const userData = {
              email: user.email,
              name: user.name || '',
              image: user.image || '',
              savedListings: [],
              receipts: [], // Add receipts array for bidirectional linking
              createdAt: serverTimestamp(),
              lastActive: serverTimestamp(),
              authProvider: 'google'
            };
            
            console.log('📝 Creating Firestore user document for Google OAuth user:', userData);
            await setDoc(userDocRef, userData);
            console.log('✅ Google OAuth user document created:', user.id);
          } else {
            // Update last active timestamp for existing user
            console.log('🔄 Updating last active timestamp for Google OAuth user:', user.id);
            await setDoc(userDocRef, { 
              lastActive: serverTimestamp(),
              name: user.name || userDoc.data()?.name,
              image: user.image || userDoc.data()?.image
            }, { merge: true });
            console.log('✅ Google OAuth user document updated');
          }
        } catch (error) {
          console.error('❌ Error handling Google OAuth user in Firestore:', error);
          // Don't block sign in if Firestore fails
        }
      }
      
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: Enable debug logs in development
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };
