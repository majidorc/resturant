import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      restaurantId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    restaurantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    restaurantId: string | null;
  }
}
