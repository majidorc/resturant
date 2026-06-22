-- Manual seed for Coolify PostgreSQL console
-- Run this in: Coolify -> your Postgres service -> Terminal or DB GUI
-- WARNING: This deletes ALL existing app data first.

DELETE FROM "Feedback";
DELETE FROM "CustomerLead";
DELETE FROM "MenuItem";
DELETE FROM "Menu";
DELETE FROM "Restaurant";
DELETE FROM "User";

-- Super Admin (admin@menuhub.com / admin1234)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
VALUES (
  'seed_admin_user_01',
  'System Administrator',
  'admin@menuhub.com',
  '$2b$12$W7KdWCpA3yE1kFBWyIuV9unZ7/HF/FiDFnWjJ0yIYRjvpMn1nrKuC',
  'SUPERADMIN',
  NOW()
);

-- Tenant owner (bistro_owner@greenbistro.com / bistro1234)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
VALUES (
  'seed_tenant_user_01',
  'John Doe',
  'bistro_owner@greenbistro.com',
  '$2b$12$lIfAZBHdZVQaWziipRAjHu0JCv.d4h503GeM2zIviy1O/F.P6RHQK',
  'TENANT',
  NOW()
);

-- Restaurant
INSERT INTO "Restaurant" ("id", "userId", "name", "slug", "wifiSsid", "wifiPassword", "googleReviewUrl", "currency", "language", "createdAt")
VALUES (
  'seed_restaurant_01',
  'seed_tenant_user_01',
  'Green Bistro Coffee',
  'green-bistro',
  'GreenBistro-Guest',
  'Welcome2024!',
  'https://g.page/r/green-bistro-coffee/review',
  'USD',
  'en',
  NOW()
);

-- Menus
INSERT INTO "Menu" ("id", "restaurantId", "name", "isActive")
VALUES
  ('seed_menu_coffee_01', 'seed_restaurant_01', 'Specialty Coffee', true),
  ('seed_menu_bakery_01', 'seed_restaurant_01', 'Artisan Bakery', true);

-- Menu items: Specialty Coffee
INSERT INTO "MenuItem" ("id", "menuId", "name", "description", "price", "imageUrl", "isAvailable")
VALUES
  ('seed_item_01', 'seed_menu_coffee_01', 'House Espresso', 'Rich double shot pulled from single-origin beans.', 3.5, NULL, true),
  ('seed_item_02', 'seed_menu_coffee_01', 'Vanilla Latte', 'Steamed milk with Madagascar vanilla syrup.', 5.25, NULL, true),
  ('seed_item_03', 'seed_menu_coffee_01', 'Cold Brew Tonic', 'Slow-steeped cold brew topped with citrus tonic.', 4.75, NULL, true);

-- Menu items: Artisan Bakery
INSERT INTO "MenuItem" ("id", "menuId", "name", "description", "price", "imageUrl", "isAvailable")
VALUES
  ('seed_item_04', 'seed_menu_bakery_01', 'Butter Croissant', 'Classic flaky French pastry baked every morning.', 3.95, NULL, true),
  ('seed_item_05', 'seed_menu_bakery_01', 'Sourdough Avocado Toast', 'Thick-cut sourdough with smashed avocado and sea salt.', 8.5, NULL, true),
  ('seed_item_06', 'seed_menu_bakery_01', 'Blueberry Muffin', 'Oven-fresh muffin with wild blueberries.', 4.25, NULL, true);

-- Customer leads (12 total: 4 pending email, 8 sent)
INSERT INTO "CustomerLead" ("id", "restaurantId", "email", "source", "emailSent", "createdAt")
VALUES
  ('seed_lead_01', 'seed_restaurant_01', 'guest01@example.com', 'GOOGLE', false, NOW() - INTERVAL '24 hours'),
  ('seed_lead_02', 'seed_restaurant_01', 'guest02@example.com', 'WIFI_UNLOCK', false, NOW() - INTERVAL '1 day'),
  ('seed_lead_03', 'seed_restaurant_01', 'guest03@example.com', 'WIFI_UNLOCK', false, NOW() - INTERVAL '2 days'),
  ('seed_lead_04', 'seed_restaurant_01', 'guest04@example.com', 'GOOGLE', false, NOW() - INTERVAL '3 days'),
  ('seed_lead_05', 'seed_restaurant_01', 'guest05@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '1 day'),
  ('seed_lead_06', 'seed_restaurant_01', 'guest06@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '2 days'),
  ('seed_lead_07', 'seed_restaurant_01', 'guest07@example.com', 'GOOGLE', true, NOW() - INTERVAL '2 days'),
  ('seed_lead_08', 'seed_restaurant_01', 'guest08@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '3 days'),
  ('seed_lead_09', 'seed_restaurant_01', 'guest09@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '4 days'),
  ('seed_lead_10', 'seed_restaurant_01', 'guest10@example.com', 'GOOGLE', true, NOW() - INTERVAL '4 days'),
  ('seed_lead_11', 'seed_restaurant_01', 'guest11@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '5 days'),
  ('seed_lead_12', 'seed_restaurant_01', 'guest12@example.com', 'WIFI_UNLOCK', true, NOW() - INTERVAL '5 days');

-- Internal feedback
INSERT INTO "Feedback" ("id", "restaurantId", "rating", "comment", "createdAt")
VALUES
  ('seed_feedback_01', 'seed_restaurant_01', 2, 'Service was slightly slow during the lunch rush.', NOW() - INTERVAL '2 days'),
  ('seed_feedback_02', 'seed_restaurant_01', 2, 'Coffee took longer than expected to arrive.', NOW() - INTERVAL '3 days'),
  ('seed_feedback_03', 'seed_restaurant_01', 3, 'Food was good but the seating area could be cleaner.', NOW() - INTERVAL '4 days');
