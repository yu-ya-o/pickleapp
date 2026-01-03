-- CreateEnum
CREATE TYPE "CourtStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ListingPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phoneNumber" TEXT,
    "websiteUrl" TEXT,
    "email" TEXT,
    "courtsCount" INTEGER,
    "indoorOutdoor" TEXT,
    "surface" TEXT,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "operatingHours" TEXT,
    "priceInfo" TEXT,
    "status" "CourtStatus" NOT NULL DEFAULT 'ACTIVE',
    "listingPlan" "ListingPlan" NOT NULL DEFAULT 'FREE',
    "freeUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- AlterTable Event - Add courtId
ALTER TABLE "Event" ADD COLUMN "courtId" TEXT;

-- AlterTable TeamEvent - Add courtId
ALTER TABLE "TeamEvent" ADD COLUMN "courtId" TEXT;

-- CreateIndex
CREATE INDEX "Court_region_idx" ON "Court"("region");
CREATE INDEX "Court_status_idx" ON "Court"("status");
CREATE INDEX "Court_indoorOutdoor_idx" ON "Court"("indoorOutdoor");
CREATE INDEX "Event_courtId_idx" ON "Event"("courtId");
CREATE INDEX "TeamEvent_courtId_idx" ON "TeamEvent"("courtId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEvent" ADD CONSTRAINT "TeamEvent_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;
