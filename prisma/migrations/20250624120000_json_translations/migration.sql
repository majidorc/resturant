-- Rename dashboard UI language column and add tenant menu language configuration.
ALTER TABLE "Restaurant" RENAME COLUMN "language" TO "uiLanguage";

ALTER TABLE "Restaurant" ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY['en']::TEXT[];

UPDATE "Restaurant" SET "languages" = ARRAY['en', 'th']::TEXT[];

-- Migrate bilingual menu category names into JSON translation objects.
ALTER TABLE "Menu" ADD COLUMN "name" JSONB;

UPDATE "Menu"
SET "name" = jsonb_strip_nulls(
  jsonb_build_object('en', "nameEn", 'th', "nameTh")
);

ALTER TABLE "Menu" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "Menu" DROP COLUMN "nameEn";
ALTER TABLE "Menu" DROP COLUMN "nameTh";

-- Migrate bilingual menu item fields into JSON translation objects.
ALTER TABLE "MenuItem" ADD COLUMN "name" JSONB;
ALTER TABLE "MenuItem" ADD COLUMN "description" JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE "MenuItem"
SET
  "name" = jsonb_strip_nulls(
    jsonb_build_object('en', "nameEn", 'th', "nameTh")
  ),
  "description" = jsonb_strip_nulls(
    jsonb_build_object('en', "descriptionEn", 'th', "descriptionTh")
  );

ALTER TABLE "MenuItem" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "MenuItem" DROP COLUMN "nameEn";
ALTER TABLE "MenuItem" DROP COLUMN "nameTh";
ALTER TABLE "MenuItem" DROP COLUMN "descriptionEn";
ALTER TABLE "MenuItem" DROP COLUMN "descriptionTh";
