import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { MatchCancelledEvent } from "../../types/notifications";

export const handleMatchCancelled = async (job: Job<MatchCancelledEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.MATCH_CANCELLED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `MATCH_CANCELLED:${data.matchId}:${data.playerId}`
  });
};
