import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    emailVerified?: Date | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    emailVerified?: Date | null;
  }
}
