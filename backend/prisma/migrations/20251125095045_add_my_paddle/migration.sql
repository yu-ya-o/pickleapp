-- AlterTable: Add myPaddle column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'myPaddle'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "myPaddle" TEXT;
    END IF;
END $$;
