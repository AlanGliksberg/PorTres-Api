import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { AscendDescendEvent } from "../../types/notifications";

export const handlePlayerAscended = async (job: Job<AscendDescendEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_ASCENDED,
    matchId: 0,
    playerId: data.playerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_ASCENDED:${data.category}:${data.playerId}`
  });
};
