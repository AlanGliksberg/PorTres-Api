import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { PlayerAddedToMatchEvent } from "../../types/notifications";

export const handlePlayerAddedToMatch = async (job: Job<PlayerAddedToMatchEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_ADDED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_ADDED:${data.matchId}:${data.playerId}:${data.teamNumber}`
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
