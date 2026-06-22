-- Menu: split name into bilingual fields
ALTER TABLE "Menu" RENAME COLUMN "name" TO "nameEn";
ALTER TABLE "Menu" ADD COLUMN "nameTh" TEXT NOT NULL DEFAULT '';
UPDATE "Menu" SET "nameTh" = "nameEn" WHERE "nameTh" = '';

-- MenuItem: split name and description into bilingual fields
ALTER TABLE "MenuItem" RENAME COLUMN "name" TO "nameEn";
ALTER TABLE "MenuItem" ADD COLUMN "nameTh" TEXT NOT NULL DEFAULT '';
UPDATE "MenuItem" SET "nameTh" = "nameEn" WHERE "nameTh" = '';

ALTER TABLE "MenuItem" RENAME COLUMN "description" TO "descriptionEn";
ALTER TABLE "MenuItem" ADD COLUMN "descriptionTh" TEXT;
UPDATE "MenuItem" SET "descriptionTh" = "descriptionEn";
