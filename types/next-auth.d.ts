import 'next-auth';
import 'next-auth/jwt';
import type { User as UserType } from '@/lib/types';

declare module 'next-auth' {
  interface Session {
    /** Stored user id, present only for an address found in the directory. */
    userId?: string;
    /** True when Google confirmed an address that is absent from the directory. */
    unregistered?: boolean;
    /** User's full name from the directory. */
    fullName?: string;
    /** User's role from the directory. */
    role?: UserType['role'];
    /** User's avatar URL from the directory. */
    avatarUrl?: string;
    /** User's birth date from the directory. */
    birthDate?: string;
    /** User's department from the directory. */
    department?: string;
    /** User's Google subject ID from the directory. */
    googleSub?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    unregistered?: boolean;
    fullName?: string;
    role?: UserType['role'];
    avatarUrl?: string;
    birthDate?: string;
    department?: string;
    googleSub?: string | null;
  }
}
