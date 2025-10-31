import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { PlayerRemovedFromMatchEvent } from "../../types/notifications";

export const handlePlayerRemovedFromMatch = async (job: Job<PlayerRemovedFromMatchEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_REMOVED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_REMOVED:${data.matchId}:${data.playerId}`
  });
};
