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
      const isAdmin = nextUrl.pathname.startsWith("/admin");

      if (isAdmin) {
        if (!auth?.user) {
          return false;
        }

        if (auth.user.role !== "SUPERADMIN") {
          return Response.redirect(new URL("/access-denied", nextUrl));
        }

        return true;
      }

      if (isDashboard) {
        if (!auth?.user) {
          return false;
        }

        if (auth.user.role === "SUPERADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.restaurantId = user.restaurantId;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
        session.user.restaurantId =
          typeof token.restaurantId === "string" ? token.restaurantId : null;
        session.user.role =
          token.role === "SUPERADMIN" || token.role === "TENANT" ? token.role : "TENANT";
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
