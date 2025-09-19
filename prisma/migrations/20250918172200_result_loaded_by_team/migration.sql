/*
  Warnings:

  - You are about to drop the column `loadedByTeam` on the `Set` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "resultLoadedByTeam" INTEGER;

-- AlterTable
ALTER TABLE "Set" DROP COLUMN "loadedByTeam";
