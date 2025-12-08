-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_matchId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationIntent" DROP CONSTRAINT "NotificationIntent_matchId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerRankingChange" DROP CONSTRAINT "PlayerRankingChange_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_matchId_fkey";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRankingChange" ADD CONSTRAINT "PlayerRankingChange_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationIntent" ADD CONSTRAINT "NotificationIntent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
