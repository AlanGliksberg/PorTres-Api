/*
  Warnings:

  - Made the column `local_min` on table `Match` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "local_min" SET NOT NULL;
