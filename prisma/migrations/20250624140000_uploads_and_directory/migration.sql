-- Restaurant branding and location metadata.
ALTER TABLE "Restaurant" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "city" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "country" TEXT;

-- Replace single image URL with local upload path array (max 3 enforced in app layer).
ALTER TABLE "MenuItem" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "MenuItem"
SET "images" = ARRAY["imageUrl"]::TEXT[]
WHERE "imageUrl" IS NOT NULL AND TRIM("imageUrl") <> '';

ALTER TABLE "MenuItem" DROP COLUMN "imageUrl";
