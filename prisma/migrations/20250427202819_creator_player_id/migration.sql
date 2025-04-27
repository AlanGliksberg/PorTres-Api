/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Match` table. All the data in the column will be lost.
  - Added the required column `creatorPlayerId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_creatorId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "creatorId",
ADD COLUMN     "creatorPlayerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_creatorPlayerId_fkey" FOREIGN KEY ("creatorPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
