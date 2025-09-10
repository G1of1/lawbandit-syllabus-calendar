import { Account, AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // ✅ Google gives expires_at in seconds since epoch
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
        return token;
      }

      // Return previous token if still valid
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Refresh the token
      try {
        const url = "https://oauth2.googleapis.com/token";
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });

        const refreshed = await response.json();
        if (!response.ok) throw refreshed;

        token.accessToken = refreshed.access_token;
        token.expiresAt = Date.now() + refreshed.expires_in * 1000;
        // ✅ Keep the same refresh token if Google didn’t return a new one
        token.refreshToken = refreshed.refresh_token ?? token.refreshToken;

        return token;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
