import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const SEED_EMAIL = "bistro_owner@greenbistro.com";
const SEED_PASSWORD = "bistro1234";
const ADMIN_EMAIL = "admin@menuhub.com";
const ADMIN_PASSWORD = "admin1234";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number, hourOffset = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hourOffset, 30, 0, 0);
  return date;
}

async function main() {
  console.log("Clearing existing data...");

  await prisma.feedback.deleteMany();
  await prisma.customerLead.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Green Bistro Coffee tenant...");

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: "SUPERADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: SEED_EMAIL,
      password: hashedPassword,
      role: "TENANT",
      restaurant: {
        create: {
          name: "Green Bistro Coffee",
          slug: "green-bistro",
          wifiSsid: "GreenBistro-Guest",
          wifiPassword: "Welcome2024!",
          googleReviewUrl: "https://g.page/r/green-bistro-coffee/review",
        },
      },
    },
    include: { restaurant: true },
  });

  const restaurant = user.restaurant!;

  const specialtyCoffee = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: "Specialty Coffee",
      isActive: true,
      items: {
        create: [
          {
            name: "House Espresso",
            description: "Rich double shot pulled from single-origin beans.",
            price: 3.5,
          },
          {
            name: "Vanilla Latte",
            description: "Steamed milk with Madagascar vanilla syrup.",
            price: 5.25,
          },
          {
            name: "Cold Brew Tonic",
            description: "Slow-steeped cold brew topped with citrus tonic.",
            price: 4.75,
          },
        ],
      },
    },
  });

  const artisanBakery = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: "Artisan Bakery",
      isActive: true,
      items: {
        create: [
          {
            name: "Butter Croissant",
            description: "Classic flaky French pastry baked every morning.",
            price: 3.95,
          },
          {
            name: "Sourdough Avocado Toast",
            description: "Thick-cut sourdough with smashed avocado and sea salt.",
            price: 8.5,
          },
          {
            name: "Blueberry Muffin",
            description: "Oven-fresh muffin with wild blueberries.",
            price: 4.25,
          },
        ],
      },
    },
  });

  const leadEmails = Array.from({ length: 12 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `guest${number}@example.com`;
  });

  const leadSchedules = [
    { emailIndex: 0, createdAt: hoursAgo(24), emailSent: false },
    { emailIndex: 1, createdAt: daysAgo(1, 9), emailSent: false },
    { emailIndex: 2, createdAt: daysAgo(2, 14), emailSent: false },
    { emailIndex: 3, createdAt: daysAgo(3, 11), emailSent: false },
    { emailIndex: 4, createdAt: daysAgo(1, 18), emailSent: true },
    { emailIndex: 5, createdAt: daysAgo(2, 8), emailSent: true },
    { emailIndex: 6, createdAt: daysAgo(2, 19), emailSent: true },
    { emailIndex: 7, createdAt: daysAgo(3, 16), emailSent: true },
    { emailIndex: 8, createdAt: daysAgo(4, 10), emailSent: true },
    { emailIndex: 9, createdAt: daysAgo(4, 20), emailSent: true },
    { emailIndex: 10, createdAt: daysAgo(5, 13), emailSent: true },
    { emailIndex: 11, createdAt: daysAgo(5, 17), emailSent: true },
  ];

  for (const lead of leadSchedules) {
    await prisma.customerLead.create({
      data: {
        restaurantId: restaurant.id,
        email: leadEmails[lead.emailIndex],
        source: lead.emailIndex % 3 === 0 ? "GOOGLE" : "WIFI_UNLOCK",
        emailSent: lead.emailSent,
        createdAt: lead.createdAt,
      },
    });
  }

  await prisma.feedback.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        rating: 2,
        comment: "Service was slightly slow during the lunch rush.",
        createdAt: daysAgo(2, 15),
      },
      {
        restaurantId: restaurant.id,
        rating: 2,
        comment: "Coffee took longer than expected to arrive.",
        createdAt: daysAgo(3, 12),
      },
      {
        restaurantId: restaurant.id,
        rating: 3,
        comment: "Food was good but the seating area could be cleaner.",
        createdAt: daysAgo(4, 17),
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`Tenant login: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`Super admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Public menu: /menu/${restaurant.slug}`);
  console.log(`Menus created: ${specialtyCoffee.name}, ${artisanBakery.name}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
