/*
  Warnings:

  - The values [MATCH_POST_1H] on the enum `NotificationIntentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationIntentType_new" AS ENUM ('PLAYER_ADDED', 'PLAYER_APPLIED', 'MATCH_CANCELLED', 'PLAYER_REMOVED', 'APPLICATION_REJECTED', 'MATCH_CONFIRMED', 'MATCH_REMINDER_1H', 'MATCH_LOAD_RESULT');
ALTER TABLE "NotificationIntent" ALTER COLUMN "type" TYPE "NotificationIntentType_new" USING ("type"::text::"NotificationIntentType_new");
ALTER TYPE "NotificationIntentType" RENAME TO "NotificationIntentType_old";
ALTER TYPE "NotificationIntentType_new" RENAME TO "NotificationIntentType";
DROP TYPE "public"."NotificationIntentType_old";
COMMIT;
