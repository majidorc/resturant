import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboard) {
        return !!auth?.user;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.restaurantId = user.restaurantId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.restaurantId = token.restaurantId;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
