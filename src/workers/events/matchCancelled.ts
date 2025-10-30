import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import prisma from "../../prisma/client";
import { MatchCancelledEvent } from "../../types/notifications";

export const handleMatchCancelled = async (job: Job<MatchCancelledEvent>) => {
  const { data } = job;

  const match = await prisma.match.findUnique({
    where: { id: data.matchId }
  });

  if (!match) {
    console.warn(`[Notifications] MatchCancelled ignorado | matchId=${data.matchId} no encontrado | jobId=${job.id}`);
    return;
  }

  if (!data.playerId) {
    console.warn(`[Notifications] MatchCancelled sin playerId | matchId=${data.matchId} | jobId=${job.id}`);
    return;
  }

  await createNotificationIntent({
    type: NotificationIntentType.MATCH_CANCELLED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `MATCH_CANCELLED:${data.matchId}:${data.playerId}`
  });
};
