/*
  Warnings:

  - Made the column `code` on table `MatchStatus` required. This step will fail if there are existing NULL values in that column.
  - Made the column `label` on table `MatchStatus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MatchStatus" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "label" SET NOT NULL;
