-- Add appleId column for Apple Sign In support
ALTER TABLE "User"
ADD COLUMN     "appleId" TEXT;

CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");
