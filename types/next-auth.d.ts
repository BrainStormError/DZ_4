import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    /** Stored user id, present only for an address found in the directory. */
    userId?: string;
    /** True when Google confirmed an address that is absent from the directory. */
    unregistered?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    unregistered?: boolean;
  }
}
