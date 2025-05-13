/*
  Warnings:

  - A unique constraint covering the columns `[matchId,teamNumber]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Team_matchId_teamNumber_key" ON "Team"("matchId", "teamNumber");
