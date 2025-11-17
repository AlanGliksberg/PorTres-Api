-- Create enum for social platforms
CREATE TYPE "SocialPlatform" AS ENUM ('GOOGLE', 'APPLE');

-- Add new columns for unified social auth
ALTER TABLE "User"
ADD COLUMN     "socialId" TEXT,
ADD COLUMN     "socialPlatform" "SocialPlatform";

-- Copy previous provider data into the new fields
UPDATE "User"
SET "socialId" = "googleId",
    "socialPlatform" = 'GOOGLE'
WHERE "googleId" IS NOT NULL;

UPDATE "User"
SET "socialId" = "appleId",
    "socialPlatform" = 'APPLE'
WHERE "appleId" IS NOT NULL;

CREATE UNIQUE INDEX "User_socialId_key" ON "User"("socialId");

-- Drop old unique indexes before dropping columns
DROP INDEX IF EXISTS "User_googleId_key";
DROP INDEX IF EXISTS "User_appleId_key";

ALTER TABLE "User"
DROP COLUMN "googleId",
DROP COLUMN "appleId";
