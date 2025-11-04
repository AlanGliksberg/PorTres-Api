import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { ApplicationAcceptedEvent } from "../../types/notifications";

export const handleApplicationAccepted = async (job: Job<ApplicationAcceptedEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.APPLICATION_ACCEPTED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `APPLICATION_ACCEPTED:${data.matchId}:${data.playerId}`
  });
};
