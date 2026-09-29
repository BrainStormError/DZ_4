import { cookies } from 'next/headers';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { findUserByEmail, findUserByGoogleSub } from './repository';
import { registrationCookieAttributes, registrationCookieName } from './cookies';
import { requireSecret } from './config';
import { resolveSignInUser } from './identity';
import { logEvent } from './log';
import {
  REGISTRATION_TTL_SECONDS,
  createRegistrationTicket,
} from './registration-ticket';

/** The session has a bounded, documented lifetime of 12 hours. */
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

const useSecureCookies = process.env.NODE_ENV === 'production';
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

function googleSubOf(profile: unknown): string | null {
  const sub = (profile as { sub?: unknown } | undefined)?.sub;
  return typeof sub === 'string' && sub ? sub : null;
}

function clearRegistrationTicket() {
  cookies().set(registrationCookieName(), '', registrationCookieAttributes(0));
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  get secret() {
    return requireSecret('NEXTAUTH_SECRET');
  },
  useSecureCookies,
  // HttpOnly and SameSite=Lax; `Secure` and the `__Secure-` prefix are forced
  // whenever the application runs in production, so the transport attributes
  // follow the served scheme rather than the configured address string.
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        maxAge: SESSION_MAX_AGE_SECONDS,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') {
        logEvent('sign_in', 'refused', { reason: 'provider', account: user.email });
        return false;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        logEvent('sign_in', 'refused', { reason: 'no_email' });
        return false;
      }

      // Refuse an account whose address Google did not confirm.
      const confirmed = (profile as { email_verified?: boolean } | undefined)
        ?.email_verified;
      if (confirmed !== true) {
        logEvent('sign_in', 'refused', { reason: 'unconfirmed', account: email });
        return false;
      }

      const resolution = await resolveSignInUser(email, googleSubOf(profile));
      if (resolution.status === 'subject_mismatch') {
        logEvent('sign_in', 'refused', {
          reason: 'subject_mismatch',
          account: email,
        });
        return false;
      }

      if (resolution.status === 'known') {
        // A known address never needs a registration ticket.
        clearRegistrationTicket();
        logEvent('sign_in', 'accepted', { account: email });
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
      cookies().set(
        registrationCookieName(),
        ticket,
        registrationCookieAttributes(REGISTRATION_TTL_SECONDS)
      );
      logEvent('sign_in', 'accepted', { account: email, registration: 'started' });
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        token.email = email;
        const sub = googleSubOf(profile);
        const stored =
          (await findUserByEmail(email)) ?? (sub ? await findUserByGoogleSub(sub) : null);
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
      if (session.user && typeof token.email === 'string') {
        session.user.email = token.email;
      }
      return session;
    },
  },
};
