// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  export interface Account {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    token_type?: string;
    id_token?: string;
    scope?: string;
  }
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
