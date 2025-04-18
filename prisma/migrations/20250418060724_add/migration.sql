/*
  Warnings:

  - Added the required column `description` to the `MatchStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchStatus" ADD COLUMN     "description" TEXT NOT NULL;
