/*
  Warnings:

  - Added the required column `gender` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "gender" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "gender" TEXT NOT NULL;
