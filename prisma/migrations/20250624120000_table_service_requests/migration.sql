-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CALL_WAITER', 'REQUEST_BILL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "tablesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TableServiceRequest" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TableServiceRequest_restaurantId_status_createdAt_idx" ON "TableServiceRequest"("restaurantId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "TableServiceRequest" ADD CONSTRAINT "TableServiceRequest_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
