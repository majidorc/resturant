"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUniqueSlug } from "@/lib/slug";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerTenant(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const restaurantName = formData.get("restaurantName")?.toString().trim();

  if (!name || !email || !password || !restaurantName) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const slug = await createUniqueSlug(restaurantName, async (candidate) => {
    const existing = await prisma.restaurant.findUnique({ where: { slug: candidate } });
    return !!existing;
  });

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "TENANT",
      restaurant: {
        create: {
          name: restaurantName,
          slug,
          languages: ["en"],
        },
      },
    },
  });

  return { success: true };
}
