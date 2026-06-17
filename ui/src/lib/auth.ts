import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { getDevelopers } from './thoughts';

interface GitHubProfile {
  login: string;
  email?: string;
  name?: string;
}

const providers: NextAuthOptions['providers'] = [];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        console.log('[NextAuth] signIn callback:', {
          provider: account.provider,
          userEmail: user.email,
          userName: user.name,
          profileLogin: (profile as any)?.login
        });
        try {
          const accessToken = account?.access_token;
          console.log('[NextAuth] Testing token:', { hasToken: !!accessToken, tokenPrefix: accessToken?.slice(0, 8) });
          if (accessToken) {
            const testResp = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
            const testData = await testResp.json();
            console.log('[NextAuth] Token test /user:', { status: testResp.status, login: testData.login });
            const repoResp = await fetch('https://api.github.com/repos/Way-Of/f-rr-d', { headers: { Authorization: `Bearer ${accessToken}` } });
            console.log('[NextAuth] Token test /repo:', { status: repoResp.status });
          }
          const devs = await getDevelopers('github', 'main', accessToken);
          const ghProfile = profile as GitHubProfile;
          const dev = devs.find(d => d.githubUsername.toLowerCase() === (ghProfile?.login || '').toLowerCase());
          if (dev) {
            console.log('[NextAuth] Developer matched:', { devId: dev.id, role: dev.role, githubUsername: dev.githubUsername });
            (user as any).devId = dev.id;
            (user as any).devRole = dev.role;
            (user as any).devPincode = dev.pincode;
          } else {
            console.log('[NextAuth] No developer matched for GitHub user:', ghProfile?.login);
            console.log('[NextAuth] Available developers:', devs.map(d => ({ id: d.id, githubUsername: d.githubUsername })));
          }
        } catch (e) {
          console.error('[NextAuth] Error fetching developers:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      console.log('[NextAuth] jwt callback:', { trigger, hasUser: !!user, hasAccount: !!account });
      if (user) {
        token.devId = (user as any).devId;
        token.devRole = (user as any).devRole;
        token.accessToken = account?.access_token;
        console.log('[NextAuth] JWT token set:', { devId: token.devId, devRole: token.devRole });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[NextAuth] session callback:', { devId: token.devId, devRole: token.devRole });
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
  debug: process.env.NODE_ENV === 'development',
};