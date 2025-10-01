/*
  Warnings:

  - Added the required column `isWinner` to the `PlayerRankingChange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerRankingChange" ADD COLUMN     "isWinner" BOOLEAN NOT NULL;
