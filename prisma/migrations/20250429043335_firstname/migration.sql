/*
  Warnings:

  - You are about to drop the column `name` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT;
