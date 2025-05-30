/*
  Warnings:

  - You are about to drop the column `level` on the `Player` table. All the data in the column will be lost.
  - Added the required column `position` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('REVES', 'DRIVE', 'INDISTINTO');

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "level",
ADD COLUMN     "levelId" TEXT,
ADD COLUMN     "position" "PlayerPosition" NOT NULL;

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "genderId" TEXT NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_code_key" ON "Level"("code");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
