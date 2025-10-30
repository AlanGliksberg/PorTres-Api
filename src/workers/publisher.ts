import { notificationQueue } from "../infrastructure/events/notification.queue";
import {
  MatchCancelledEvent,
  NotificationJobData,
  PlayerAddedToMatchEvent,
  PlayerAppliedToMatchEvent
} from "../types/notifications";
import { NotificationJobType } from "../types/notificationTypes";

const publishEvent = async (eventType: NotificationJobType, event: NotificationJobData, jobId: string) => {
  try {
    await notificationQueue.add(eventType, event, {
      jobId
    });
  } catch (error) {
    console.error(`[Notifications] failed to enqueue ${eventType} event`, error);
  }
};

const getJobId = (type: NotificationJobType, matchId: number, playerId: number, createdAt: string) => {
  const createdAtTimestamp = new Date(createdAt).getTime();
  const createdAtToken = Number.isNaN(createdAtTimestamp)
    ? createdAt.replace(/[^a-zA-Z0-9]/g, "-")
    : createdAtTimestamp.toString();
  return [type, matchId, playerId, createdAtToken].join("-");
};

export const publishPlayerAddedToMatch = async (
  matchId: number,
  playerId: number,
  addedByPlayerId: number,
  teamNumber: number
) => {
  const event: PlayerAddedToMatchEvent = {
    matchId,
    playerId,
    addedByPlayerId,
    teamNumber,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.PLAYER_ADDED_TO_MATCH_JOB, matchId, playerId, event.createdAt);
  await publishEvent(NotificationJobType.PLAYER_ADDED_TO_MATCH_JOB, event, jobId);
};

export const publishPlayerAppliedToMatch = async (
  matchId: number,
  playerAppliedId: number,
  playerOwnerId: number,
  teamNumber?: number
) => {
  const event: PlayerAppliedToMatchEvent = {
    matchId,
    playerAppliedId,
    playerOwnerId,
    teamNumber,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.PLAYER_APPLIED_TO_MATCH_JOB, matchId, playerOwnerId, event.createdAt);
  await publishEvent(NotificationJobType.PLAYER_APPLIED_TO_MATCH_JOB, event, jobId);
};

export const publishMatchCancelled = async (matchId: number, playerId: number) => {
  const event: MatchCancelledEvent = {
    matchId,
    playerId,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.MATCH_CANCELLED_JOB, matchId, playerId, event.createdAt);
  await publishEvent(NotificationJobType.MATCH_CANCELLED_JOB, event, jobId);
};
