import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { ResultRejectedEvent } from "../../types/notifications";
import { HOUR_IN_MS } from "../../constants/common";
import { NotificationJobType } from "../../types/notificationTypes";
import { getJobId } from "../publisher";
import { notificationQueue } from "../../infrastructure/events/notification.queue";

export const handleResultRejected = async (job: Job<ResultRejectedEvent>) => {
  const { data } = job;

  data.playerIds.forEach(async (playerId) => {
    await createNotificationIntent({
      type: NotificationIntentType.RESULT_REJECTED,
      matchId: data.matchId,
      playerId,
      scheduledAt: new Date(),
      payload: data,
      dedupeKey: `RESULT_REJECTED:${data.matchId}:${playerId}`
    });
  });

  // Evento para confirmar automáticamente el resultado
  const resultConfirmedAt = new Date(new Date().getTime() + 3 * HOUR_IN_MS + 48 * HOUR_IN_MS);
  const resultConfirmedAtDelay = Math.max(0, resultConfirmedAt.getTime() - Date.now());

  const jobId = getJobId(NotificationJobType.RESULT_AUTO_ACCEPTED_JOB, data.matchId, data.playerIds, data.createdAt);
  const oldJob = await notificationQueue.getJob(jobId);
  if (oldJob) {
    await oldJob.remove();
  }

  await notificationQueue.add(NotificationJobType.RESULT_AUTO_ACCEPTED_JOB, data, {
    jobId,
    delay: resultConfirmedAtDelay
  });
};
