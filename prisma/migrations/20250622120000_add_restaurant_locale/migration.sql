-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Restaurant" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
