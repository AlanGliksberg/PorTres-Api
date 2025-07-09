/*
  Warnings:

  - You are about to drop the column `name` on the `MatchStatus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `MatchStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MatchStatus_name_key";

-- AlterTable
ALTER TABLE "MatchStatus" DROP COLUMN "name",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "label" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MatchStatus_code_key" ON "MatchStatus"("code");
