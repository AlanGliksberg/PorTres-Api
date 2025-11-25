-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "matchClubId" INTEGER;

-- CreateTable
CREATE TABLE "MatchClub" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MatchClub_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchClubId_fkey" FOREIGN KEY ("matchClubId") REFERENCES "MatchClub"("id") ON DELETE SET NULL ON UPDATE CASCADE;
