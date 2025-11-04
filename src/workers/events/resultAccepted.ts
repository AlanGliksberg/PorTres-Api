import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { ResultAcceptedEvent } from "../../types/notifications";

export const handleResultAccepted = async (job: Job<ResultAcceptedEvent>) => {
  const { data } = job;

  data.playerIds.forEach(async (playerId) => {
    await createNotificationIntent({
      type: NotificationIntentType.RESULT_ACCEPTED,
      matchId: data.matchId,
      playerId,
      scheduledAt: new Date(),
      payload: data,
      dedupeKey: `RESULT_ACCEPTED:${data.matchId}:${playerId}`
    });
  });
};
