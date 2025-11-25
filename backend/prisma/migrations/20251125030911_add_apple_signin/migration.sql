-- AlterTable: Make googleId nullable and add appleId
ALTER TABLE "User" ALTER COLUMN "googleId" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "appleId" TEXT;

-- CreateIndex: Add unique constraint and index for appleId
CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");
CREATE INDEX "User_appleId_idx" ON "User"("appleId");
