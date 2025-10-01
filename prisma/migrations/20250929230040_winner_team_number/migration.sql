/*
  Warnings:

  - You are about to drop the column `winnerTeamId` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "winnerTeamId",
ADD COLUMN     "winnerTeamNumber" INTEGER;
