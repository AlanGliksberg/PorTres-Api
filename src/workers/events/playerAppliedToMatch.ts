import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import prisma from "../../prisma/client";
import { PlayerAppliedToMatchEvent } from "../../types/notifications";

export const handlePlayerAppliedToMatch = async (job: Job<PlayerAppliedToMatchEvent>) => {
  const { data } = job;

  const match = await prisma.match.findUnique({
    where: { id: data.matchId }
  });

  if (!match) {
    console.warn(
      `[Notifications] PlayerAppliedToMatch ignorado | matchId=${data.matchId} no encontrado | jobId=${job.id}`
    );
    return;
  }

  if (!data.playerAppliedId || !data.playerOwnerId) {
    console.warn(`[Notifications] PlayerAppliedToMatch sin playerId | matchId=${data.matchId} | jobId=${job.id}`);
    return;
  }

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_APPLIED,
    matchId: data.matchId,
    playerId: data.playerOwnerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_APPLIED:${data.matchId}:${data.playerAppliedId}`
  });
};
