import { Prisma } from "@prisma/client";

export enum NotificationJobType {
  NOTIFICATION_QUEUE_NAME = "notification-events",
  PLAYER_ADDED_TO_MATCH_JOB = "player-added-to-match",
  PLAYER_APPLIED_TO_MATCH_JOB = "player-applied-to-match",
  MATCH_CANCELLED_JOB = "match-cancelled",
  PLAYER_REMOVED_FROM_MATCH_JOB = "player-removed-from-match",
  APPLICATION_REJECTED_JOB = "application-rejected",
  APPLICATION_ACCEPTED_JOB = "application-accepted",
  MATCH_CONFIRMED_JOB = "match-confirmed",
  MATCH_CLOSED_JOB = "match-closed",
  RESULT_CREATED_JOB = "result-created",
  RESULT_AUTO_ACCEPTED_JOB = "result-auto-accepted",
  RESULT_REJECTED_JOB = "result-rejected",
  RESULT_ACCEPTED_JOB = "result-accepted",
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
