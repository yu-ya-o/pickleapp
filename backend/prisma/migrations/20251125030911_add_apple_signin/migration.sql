-- AlterTable: Make googleId nullable
ALTER TABLE "User" ALTER COLUMN "googleId" DROP NOT NULL;

-- AlterTable: Add appleId column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'appleId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "appleId" TEXT;
    END IF;
END $$;

-- CreateIndex: Add unique constraint for appleId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'User' AND indexname = 'User_appleId_key'
    ) THEN
        CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");
    END IF;
END $$;

-- CreateIndex: Add index for appleId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'User' AND indexname = 'User_appleId_idx'
    ) THEN
        CREATE INDEX "User_appleId_idx" ON "User"("appleId");
    END IF;
END $$;
