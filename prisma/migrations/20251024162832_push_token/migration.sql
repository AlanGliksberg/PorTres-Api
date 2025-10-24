-- AlterTable
ALTER TABLE "_PlayerToTeam" ADD CONSTRAINT "_PlayerToTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_PlayerToTeam_AB_unique";

-- AlterTable
ALTER TABLE "_matchPlayers" ADD CONSTRAINT "_matchPlayers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_matchPlayers_AB_unique";

-- CreateTable
CREATE TABLE "ExpoPushToken" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpoPushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpoPushToken_token_key" ON "ExpoPushToken"("token");

-- CreateIndex
CREATE INDEX "ExpoPushToken_playerId_idx" ON "ExpoPushToken"("playerId");

-- AddForeignKey
ALTER TABLE "ExpoPushToken" ADD CONSTRAINT "ExpoPushToken_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
