import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { getDevelopers } from './thoughts';

interface GitHubProfile {
  login: string;
  email?: string;
  name?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const devs = await getDevelopers();
        const ghProfile = profile as GitHubProfile;
        const dev = devs.find(d => d.githubUsername.toLowerCase() === (user.email || '').toLowerCase() || 
                                  d.githubUsername.toLowerCase() === (ghProfile?.login || '').toLowerCase());
        if (dev) {
          (user as any).devId = dev.id;
          (user as any).devRole = dev.role;
          (user as any).devPincode = dev.pincode;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.devId = (user as any).devId;
        token.devRole = (user as any).devRole;
        token.accessToken = account?.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).devId = token.devId;
      (session as any).devRole = token.devRole;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};