import { Prisma } from "@prisma/client";

export enum NotificationJobType {
  NOTIFICATION_QUEUE_NAME = "notification-events",
  PLAYER_ADDED_TO_MATCH_JOB = "player-added-to-match",
  PLAYER_APPLIED_TO_MATCH_JOB = "player-applied-to-match",
  MATCH_CANCELLED_JOB = "match-cancelled",
  PROCESS_NOTIFICATION_INTENT_JOB = "process-notification-intent"
}

export type NotificationIntentWithRelations = Prisma.NotificationIntentGetPayload<{
  include: {
    player: { include: { expoPushTokens: true } };
    match: true;
  };
}>;

export type DispatchResult = {
  delivered: number;
  failed: number;
  warning?: string;
};
