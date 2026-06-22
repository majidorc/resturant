-- Menus
INSERT INTO "Menu" ("id", "restaurantId", "nameEn", "nameTh", "isActive")
VALUES
  ('seed_menu_coffee_01', 'seed_restaurant_01', 'Specialty Coffee', 'กาแฟพิเศษ', true),
  ('seed_menu_bakery_01', 'seed_restaurant_01', 'Artisan Bakery', 'เบเกอรี่อาร์ติซาน', true);

-- Menu items: Specialty Coffee
INSERT INTO "MenuItem" ("id", "menuId", "nameEn", "nameTh", "descriptionEn", "descriptionTh", "price", "imageUrl", "isAvailable")
VALUES
  ('seed_item_01', 'seed_menu_coffee_01', 'House Espresso', 'เอสเปรสโซ่สูตรเฮาส์', 'Rich double shot pulled from single-origin beans.', 'เอสเปรสโซ่ดับเบิลช็อตจากเมล็ดกาแฟคั่วคุณภาพ', 3.5, NULL, true),
  ('seed_item_02', 'seed_menu_coffee_01', 'Vanilla Latte', 'วานิลลาลาเต้', 'Steamed milk with Madagascar vanilla syrup.', 'นมสตีมผสมไซรัปวานิลลามาดากัสการ์', 5.25, NULL, true),
  ('seed_item_03', 'seed_menu_coffee_01', 'Cold Brew Tonic', 'โคลด์บริวโทนิค', 'Slow-steeped cold brew topped with citrus tonic.', 'โคลด์บริวแช่นานท็อปด้วยโทนิกรสซิตรัส', 4.75, NULL, true);

-- Menu items: Artisan Bakery
INSERT INTO "MenuItem" ("id", "menuId", "nameEn", "nameTh", "descriptionEn", "descriptionTh", "price", "imageUrl", "isAvailable")
VALUES
  ('seed_item_04', 'seed_menu_bakery_01', 'Butter Croissant', 'ครัวซองต์เนย', 'Classic flaky French pastry baked every morning.', 'เบเกอรี่ฝรั่งเศสสไตล์คลาสสิก อบสดใหม่ทุกเช้า', 3.95, NULL, true),
  ('seed_item_05', 'seed_menu_bakery_01', 'Sourdough Avocado Toast', 'ขนมปังซาวโดว์ท็อปอะโวคาโด', 'Thick-cut sourdough with smashed avocado and sea salt.', 'ขนมปังซาวโดว์หนา ท็อปอะโวคาโดบดและเกลือทะเล', 8.5, NULL, true),
  ('seed_item_06', 'seed_menu_bakery_01', 'Blueberry Muffin', 'มัฟฟินบลูเบอร์รี่', 'Oven-fresh muffin with wild blueberries.', 'มัฟฟินอบสดใหม่พร้อมบลูเบอร์รี่', 4.25, NULL, true);
