/*
  Warnings:

  - You are about to drop the column `isWinner` on the `PlayerRankingChange` table. All the data in the column will be lost.
  - You are about to drop the column `teamNumber` on the `PlayerRankingChange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerRankingChange" DROP COLUMN "isWinner",
DROP COLUMN "teamNumber";
