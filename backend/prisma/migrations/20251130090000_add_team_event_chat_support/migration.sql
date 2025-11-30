-- AlterTable: Make eventId optional (if not already)
DO $$
BEGIN
    ALTER TABLE "ChatRoom" ALTER COLUMN "eventId" DROP NOT NULL;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Add teamEventId column (if not exists)
DO $$
BEGIN
    ALTER TABLE "ChatRoom" ADD COLUMN "teamEventId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- CreateIndex: Add unique constraint on teamEventId (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "ChatRoom_teamEventId_key" ON "ChatRoom"("teamEventId");

-- AddForeignKey: Link ChatRoom to TeamEvent (if not exists)
DO $$
BEGIN
    ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_teamEventId_fkey" FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
