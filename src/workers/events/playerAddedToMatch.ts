import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import prisma from "../../prisma/client";
import { PlayerAddedToMatchEvent } from "../../types/notifications";

export const handlePlayerAddedToMatch = async (job: Job<PlayerAddedToMatchEvent>) => {
  const { data } = job;

  const match = await prisma.match.findUnique({
    where: { id: data.matchId }
  });

  if (!match) {
    console.warn(
      `[Notifications] PlayerAddedToMatch ignorado | matchId=${data.matchId} no encontrado | jobId=${job.id}`
    );
    return;
  }

  if (!data.playerId) {
    console.warn(`[Notifications] PlayerAddedToMatch sin playerId | matchId=${data.matchId} | jobId=${job.id}`);
    return;
  }

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_ADDED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_ADDED:${data.matchId}:${data.playerId}`
  });

  //   const reminderAt = new Date(new Date(match.dateTime).getTime() - HOUR_IN_MS);
  //   if (reminderAt.getTime() > Date.now()) {
  //     await createNotificationIntent({
  //       type: NotificationIntentType.MATCH_REMINDER_1H,
  //       matchId: data.matchId,
  //       playerId: data.playerId,
  //       scheduledAt: reminderAt,
  //       payload: { matchId: data.matchId, playerId: data.playerId },
  //       dedupeKey: `MATCH_REMINDER_1H:${data.matchId}:${data.playerId}`
  //     });
  //   }
};
