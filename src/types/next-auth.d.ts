import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      restaurantId: string | null;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    restaurantId: string | null;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    restaurantId: string | null;
    role: Role;
  }
}
