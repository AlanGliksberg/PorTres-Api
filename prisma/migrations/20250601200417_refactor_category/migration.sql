/*
  Warnings:

  - You are about to drop the column `levelId` on the `Player` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_levelId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "levelId",
ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
