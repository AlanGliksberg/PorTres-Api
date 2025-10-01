-- CreateTable
CREATE TABLE "PlayerRankingChange" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "oldPoints" INTEGER NOT NULL,
    "deltaPoints" DOUBLE PRECISION NOT NULL,
    "newPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerRankingChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRankingChange_matchId_playerId_key" ON "PlayerRankingChange"("matchId", "playerId");

-- AddForeignKey
ALTER TABLE "PlayerRankingChange" ADD CONSTRAINT "PlayerRankingChange_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRankingChange" ADD CONSTRAINT "PlayerRankingChange_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
