-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "Restaurant" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "subscriptionStatus" TEXT;
