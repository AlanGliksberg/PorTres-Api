/*
  Warnings:

  - Made the column `rankingPoints` on table `Player` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "rankingPoints" SET NOT NULL,
ALTER COLUMN "rankingPoints" SET DEFAULT 0;
