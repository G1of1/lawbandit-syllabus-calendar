import { Account, AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration
 * -----------------------
 * Handles authentication with Google, including:
 * - OAuth2 consent flow with Google Calendar scope
 * - Secure JWT storage of access/refresh tokens
 * - Automatic token refresh when access tokens expire
 * - Exposes Google access token & user ID in session
 */
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request basic profile info + Google Calendar events permission
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",         // Always show consent screen
          access_type: "offline",    // Ensures we get a refresh_token
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * JWT Callback
     * ----------------
     * - Runs on sign-in and every time a JWT is checked.
     * - Stores/refreshes Google access tokens in the JWT.
     */
    async jwt({ token, account, profile }) {
      // ✅ On first sign-in, attach tokens and profile info
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        if (profile) {
          token.sub = profile.sub; // Google user ID
        }
        // Convert Google's `expires_at` (seconds) to JS timestamp (ms)
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
        return token;
      }

      // ✅ If token is still valid, return it
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // 🔄 Otherwise, refresh the token using the refresh_token
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

        // ✅ Save new tokens
        token.accessToken = refreshed.access_token;
        token.expiresAt = Date.now() + refreshed.expires_in * 1000;
        // Keep the old refresh_token if Google doesn’t return a new one
        token.refreshToken = refreshed.refresh_token ?? token.refreshToken;

        return token;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    /**
     * Session Callback
     * ----------------
     * - Controls what gets exposed on the client-side session object.
     * - Adds accessToken & Google user ID (`sub`) for API usage.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub!; // Google user ID
      return session;
    },

    /**
     * Redirect Callback
     * -----------------
     * - Controls where the user is redirected after login.
     * - Here, always send user back to baseUrl.
     */
    async redirect({ url, baseUrl }) {
      console.log("Redirect attempt:", url, baseUrl);
      return baseUrl;
    },
  },
};
