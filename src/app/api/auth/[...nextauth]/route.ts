import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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
