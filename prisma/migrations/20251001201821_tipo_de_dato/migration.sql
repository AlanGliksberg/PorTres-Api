/*
  Warnings:

  - You are about to alter the column `deltaPoints` on the `PlayerRankingChange` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PlayerRankingChange" ALTER COLUMN "deltaPoints" SET DATA TYPE INTEGER;
