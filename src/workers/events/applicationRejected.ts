import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { ApplicationRejectedEvent } from "../../types/notifications";

export const handleApplicationRejected = async (job: Job<ApplicationRejectedEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.APPLICATION_REJECTED,
    matchId: data.matchId,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `APPLICATION_REJECTED:${data.matchId}:${data.playerId}`
  });
};
