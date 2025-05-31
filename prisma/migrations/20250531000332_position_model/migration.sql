/*
  Warnings:

  - You are about to drop the column `position` on the `Player` table. All the data in the column will be lost.
  - Added the required column `positionId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "position",
ADD COLUMN     "positionId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PlayerPosition";

-- CreateTable
CREATE TABLE "PlayerPosition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PlayerPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPosition_code_key" ON "PlayerPosition"("code");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "PlayerPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
