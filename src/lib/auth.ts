import NextAuth, { NextAuthOptions, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'

// Simple session management using localStorage
export const getSession = async () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  return token ? { token } : null;
};

export const setSession = (token: string) => {
  localStorage.setItem('token', token);
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rememberedCredentials');  // Also clear remembered credentials
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }: { session: Session & { accessToken?: string }, token: JWT & { accessToken?: string } }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions) 