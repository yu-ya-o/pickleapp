-- AlterTable: Make eventId optional and add teamEventId
ALTER TABLE "ChatRoom" ALTER COLUMN "eventId" DROP NOT NULL;

-- Add teamEventId column
ALTER TABLE "ChatRoom" ADD COLUMN "teamEventId" TEXT;

-- CreateIndex: Add unique constraint on teamEventId
CREATE UNIQUE INDEX "ChatRoom_teamEventId_key" ON "ChatRoom"("teamEventId");

-- AddForeignKey: Link ChatRoom to TeamEvent
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_teamEventId_fkey" FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
