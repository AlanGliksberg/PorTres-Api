import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { ResultCreatedEvent } from "../../types/notifications";
import { HOUR_IN_MS } from "../../constants/common";
import { NotificationJobType } from "../../types/notificationTypes";
import { getJobId } from "../publisher";
import { notificationQueue } from "../../infrastructure/events/notification.queue";

export const handleResultCreated = async (job: Job<ResultCreatedEvent>) => {
  const { data } = job;

  data.playerIds.forEach(async (playerId) => {
    await createNotificationIntent({
      type: NotificationIntentType.RESULT_CREATED,
      matchId: data.matchId,
      playerId,
      scheduledAt: new Date(),
      payload: data,
      dedupeKey: `RESULT_CREATED:${data.matchId}:${playerId}`
    });
  });

  // Evento para confirmar automáticamente el resultado
  const resultConfirmedAt = new Date(new Date().getTime() + 3 * HOUR_IN_MS + 48 * HOUR_IN_MS);
  const resultConfirmedAtDelay = Math.max(0, resultConfirmedAt.getTime() - Date.now());

  const jobId = getJobId(NotificationJobType.RESULT_AUTO_ACCEPTED_JOB, data.matchId, data.playerIds, data.createdAt);
  await notificationQueue.add(NotificationJobType.RESULT_AUTO_ACCEPTED_JOB, data, {
    jobId,
    delay: resultConfirmedAtDelay
  });
};
