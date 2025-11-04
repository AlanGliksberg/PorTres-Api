-- CreateEnum
CREATE TYPE "NotificationIntentType" AS ENUM ('PLAYER_ADDED', 'MATCH_REMINDER_1H', 'MATCH_POST_1H');

-- CreateEnum
CREATE TYPE "NotificationIntentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "NotificationIntent" (
    "id" SERIAL NOT NULL,
    "type" "NotificationIntentType" NOT NULL,
    "status" "NotificationIntentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "payload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dedupeKey" TEXT,

    CONSTRAINT "NotificationIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationIntent_dedupeKey_key" ON "NotificationIntent"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationIntent_scheduledAt_status_idx" ON "NotificationIntent"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "NotificationIntent_matchId_idx" ON "NotificationIntent"("matchId");

-- CreateIndex
CREATE INDEX "NotificationIntent_playerId_idx" ON "NotificationIntent"("playerId");

-- AddForeignKey
ALTER TABLE "NotificationIntent" ADD CONSTRAINT "NotificationIntent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationIntent" ADD CONSTRAINT "NotificationIntent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
