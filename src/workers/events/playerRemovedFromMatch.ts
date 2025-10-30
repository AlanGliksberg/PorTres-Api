import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import prisma from "../../prisma/client";
import { PlayerRemovedFromMatchEvent } from "../../types/notifications";

export const handlePlayerRemovedFromMatch = async (job: Job<PlayerRemovedFromMatchEvent>) => {
  const { data } = job;

  const match = await prisma.match.findUnique({
    where: { id: data.matchId }
  });

  if (!match) {
    console.warn(
      `[Notifications] PlayerRemovedFromMatch ignorado | matchId=${data.matchId} no encontrado | jobId=${job.id}`
    );
    return;
  }

  if (!data.playerId) {
    console.warn(`[Notifications] PlayerRemovedFromMatch sin playerId | matchId=${data.matchId} | jobId=${job.id}`);
    return;
  }

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_REMOVED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_REMOVED:${data.matchId}:${data.playerId}`
  });
};
