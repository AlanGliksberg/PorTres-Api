import { NotificationIntentType } from "@prisma/client";
import { Job } from "bullmq";
import { createNotificationIntent } from "../../modules/notifications/intent.service";
import { PlayerAppliedToMatchEvent } from "../../types/notifications";

export const handlePlayerAppliedToMatch = async (job: Job<PlayerAppliedToMatchEvent>) => {
  const { data } = job;

  await createNotificationIntent({
    type: NotificationIntentType.PLAYER_APPLIED,
    matchId: data.matchId,
    playerId: data.playerOwnerId,
    scheduledAt: new Date(),
    payload: data,
    dedupeKey: `PLAYER_APPLIED:${data.matchId}:${data.playerAppliedId}:${data.teamNumber}`
  });
};
