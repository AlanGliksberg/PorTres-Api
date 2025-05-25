/*
  Warnings:

  - You are about to drop the column `gender` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Player` table. All the data in the column will be lost.
  - Added the required column `genderId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "gender",
ADD COLUMN     "genderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "gender",
ADD COLUMN     "genderId" TEXT;

-- CreateTable
CREATE TABLE "Gender" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pluralName" TEXT NOT NULL,

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gender_code_key" ON "Gender"("code");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
