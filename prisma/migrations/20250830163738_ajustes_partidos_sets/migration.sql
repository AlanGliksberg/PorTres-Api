/*
  Warnings:

  - A unique constraint covering the columns `[matchId,setNumber]` on the table `Set` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "winnerTeamId" INTEGER;

-- CreateIndex
CREATE INDEX "Match_categoryId_genderId_dateTime_idx" ON "Match"("categoryId", "genderId", "dateTime");

-- CreateIndex
CREATE UNIQUE INDEX "Set_matchId_setNumber_key" ON "Set"("matchId", "setNumber");
