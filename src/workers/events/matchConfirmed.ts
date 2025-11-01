import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { MatchClosedEvent, MatchConfirmedEvent } from "../../types/notifications";
import { HOUR_IN_MS } from "../../constants/common";
import { getJobId } from "../publisher";
import { NotificationJobType } from "../../types/notificationTypes";
import { notificationQueue } from "../../infrastructure/events/notification.queue";

export const handleMatchConfirmed = async (job: Job<MatchConfirmedEvent>) => {
  const { data } = job;

  data.playerIds.forEach(async (playerId) => {
    if (playerId !== data.creatorPlayerId) {
      // Notificación de confirmación de partido
      await createNotificationIntent({
        type: NotificationIntentType.MATCH_CONFIRMED,
        matchId: data.matchId,
        playerId: playerId,
        scheduledAt: new Date(),
        payload: data,
        dedupeKey: `MATCH_CONFIRMED:${data.matchId}:${playerId}`
      });
    }

    // Recordatorio una hora antes del partido
    const matchReminderAt = new Date(new Date(data.dateTime).getTime() + 3 * HOUR_IN_MS - HOUR_IN_MS);
    if (matchReminderAt.getTime() > Date.now()) {
      await createNotificationIntent({
        type: NotificationIntentType.MATCH_REMINDER_1H,
        matchId: data.matchId,
        playerId: playerId,
        scheduledAt: matchReminderAt,
        payload: data,
        dedupeKey: `MATCH_REMINDER_1H:${data.matchId}:${playerId}`
      });
    }

    // Recordatorio un rato después del partido para cargar el resultado
    const resultReminderAt = new Date(new Date(data.dateTime).getTime() + 3 * HOUR_IN_MS + 2 * HOUR_IN_MS);
    await createNotificationIntent({
      type: NotificationIntentType.MATCH_LOAD_RESULT,
      matchId: data.matchId,
      playerId: playerId,
      scheduledAt: resultReminderAt,
      payload: data,
      dedupeKey: `MATCH_LOAD_RESULT:${data.matchId}:${playerId}`
    });
  });

  // Evento para cerrar el partido
  const closeMatchAt = new Date(new Date(data.dateTime).getTime() + 3 * HOUR_IN_MS + (1 / 2) * HOUR_IN_MS);
  const closeMacthDelay = Math.max(0, closeMatchAt.getTime() - Date.now());
  const event: MatchClosedEvent = {
    matchId: data.matchId
  };
  const jobId = getJobId(NotificationJobType.MATCH_CLOSED_JOB, data.matchId, data.playerIds, data.createdAt);
  await notificationQueue.add(NotificationJobType.MATCH_CLOSED_JOB, event, {
    jobId,
    delay: closeMacthDelay
  });
};
