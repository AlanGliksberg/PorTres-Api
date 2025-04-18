/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MatchStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MatchStatus_name_key" ON "MatchStatus"("name");
