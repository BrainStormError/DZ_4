import { cookies } from 'next/headers';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { findUserByEmail, findUserByGoogleSub } from './repository';
import {
  REGISTRATION_COOKIE_NAME,
  REGISTRATION_TTL_SECONDS,
  createRegistrationTicket,
} from './registration-ticket';

async function resolveStoredUser(
  email: string,
  googleSub: string | null
) {
  const byEmail = await findUserByEmail(email);
  if (byEmail) return byEmail;
  // A Google-side email change must not create a second profile.
  if (googleSub) return findUserByGoogleSub(googleSub);
  return null;
}

function googleSubOf(profile: unknown): string | null {
  const sub = (profile as { sub?: unknown } | undefined)?.sub;
  return typeof sub === 'string' && sub ? sub : null;
}

const useSecureCookies = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies,
  // HttpOnly and SameSite=Lax, and without Max-Age: a browser-session cookie
  // that client scripts can neither read nor write.
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return false;

      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      // Refuse an account whose address Google did not confirm.
      const confirmed = (profile as { email_verified?: boolean } | undefined)
        ?.email_verified;
      if (confirmed !== true) return false;

      const cookieStore = cookies();
      const stored = await resolveStoredUser(email, googleSubOf(profile));
      if (stored) {
        // A known address never needs a registration ticket.
        cookieStore.set(REGISTRATION_COOKIE_NAME, '', {
          path: '/',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax',
          secure: useSecureCookies,
        });
        return true;
      }

      // Unknown confirmed address: issue a signed, short-lived ticket that
      // carries the address and the profile facts Google already provided.
      const ticket = createRegistrationTicket({
        email,
        fullName: user.name?.trim() ?? '',
        googleSub: googleSubOf(profile),
        avatarUrl: user.image ?? null,
      });
      cookieStore.set(REGISTRATION_COOKIE_NAME, ticket, {
        path: '/',
        maxAge: REGISTRATION_TTL_SECONDS,
        httpOnly: true,
        sameSite: 'lax',
        secure: useSecureCookies,
      });
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        token.email = email;
        const stored = await resolveStoredUser(email, googleSubOf(profile));
        if (stored) {
          token.userId = stored.id;
          delete token.unregistered;
        } else {
          token.userId = undefined;
          token.unregistered = true;
        }
      } else if (!token.userId && token.email) {
        // A registration may have completed since the token was issued.
        const stored = await findUserByEmail(token.email);
        if (stored) {
          token.userId = stored.id;
          delete token.unregistered;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId;
      session.unregistered = Boolean(token.unregistered);
      return session;
    },
  },
};
