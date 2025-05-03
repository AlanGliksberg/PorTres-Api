/*
  Warnings:

  - Changed the type of `time` on the `Match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "date" SET DATA TYPE DATE,
DROP COLUMN "time",
ADD COLUMN     "time" TIME NOT NULL;
