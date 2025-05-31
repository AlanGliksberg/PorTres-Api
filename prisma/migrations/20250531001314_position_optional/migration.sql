-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_positionId_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "positionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "PlayerPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
