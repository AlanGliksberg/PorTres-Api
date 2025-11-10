import { notificationQueue } from "../infrastructure/events/notification.queue";
import { MATCH_STATUS } from "../types/matchTypes";
import {
  ApplicationAcceptedEvent,
  ApplicationRejectedEvent,
  AscendDescendEvent,
  MatchCancelledEvent,
  MatchConfirmedEvent,
  NotificationJobData,
  PlayerAddedToMatchEvent,
  PlayerAppliedToMatchEvent,
  PlayerRemovedFromMatchEvent,
  ResultAcceptedEvent,
  ResultCreatedEvent,
  ResultRejectedEvent
} from "../types/notifications";
import { NotificationJobType } from "../types/notificationTypes";
import { CATEGORY } from "../types/playerTypes";

export const publishEvent = async (eventType: NotificationJobType, event: NotificationJobData, jobId: string) => {
  try {
    await notificationQueue.add(eventType, event, {
      jobId
    });
  } catch (error) {
    console.error(`[Notifications] failed to enqueue ${eventType} event`, error);
  }
};

export const getJobId = (
  type: NotificationJobType,
  matchId: number,
  playerId: number | number[],
  createdAt: string
) => {
  const createdAtTimestamp = new Date(createdAt).getTime();
  const createdAtToken = Number.isNaN(createdAtTimestamp)
    ? createdAt.replace(/[^a-zA-Z0-9]/g, "-")
    : createdAtTimestamp.toString();
  const playerIds = Array.isArray(playerId) ? playerId.join("|") : playerId;
  return [type, matchId, playerIds, createdAtToken].join("-");
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

export const publishPlayerRemovedFromMatch = async (
  matchId: number,
  deletedPlayerId: number,
  deletedById: number,
  creatorPlayerId: number,
  playerIds: number[],
  status: MATCH_STATUS
) => {
  const event: PlayerRemovedFromMatchEvent = {
    matchId,
    deletedPlayerId,
    deletedById,
    creatorPlayerId,
    playerIds,
    status,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.PLAYER_REMOVED_FROM_MATCH_JOB, matchId, deletedPlayerId, event.createdAt);
  await publishEvent(NotificationJobType.PLAYER_REMOVED_FROM_MATCH_JOB, event, jobId);
};

export const publishApplicationRejected = async (matchId: number, playerId: number) => {
  const event: ApplicationRejectedEvent = {
    matchId,
    playerId,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.APPLICATION_REJECTED_JOB, matchId, playerId, event.createdAt);
  await publishEvent(NotificationJobType.APPLICATION_REJECTED_JOB, event, jobId);
};

export const publishApplicationAccepted = async (matchId: number, playerId: number) => {
  const event: ApplicationAcceptedEvent = {
    matchId,
    playerId,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.APPLICATION_ACCEPTED_JOB, matchId, playerId, event.createdAt);
  await publishEvent(NotificationJobType.APPLICATION_ACCEPTED_JOB, event, jobId);
};

export const publishMatchConfirmed = async (
  matchId: number,
  playerIds: number[],
  dateTime: Date,
  creatorPlayerId: number
) => {
  const event: MatchConfirmedEvent = {
    matchId,
    playerIds,
    creatorPlayerId,
    dateTime,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.MATCH_CONFIRMED_JOB, matchId, playerIds, event.createdAt);
  await publishEvent(NotificationJobType.MATCH_CONFIRMED_JOB, event, jobId);
};

export const publishResultCreated = async (matchId: number, playerIds: number[], resultLoadedByTeam: number) => {
  const event: ResultCreatedEvent = {
    matchId,
    playerIds,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.RESULT_CREATED_JOB, matchId, playerIds, event.createdAt);
  await publishEvent(NotificationJobType.RESULT_CREATED_JOB, event, jobId);
};

export const publishResultRejected = async (matchId: number, playerIds: number[], resultLoadedByTeam: number) => {
  const event: ResultRejectedEvent = {
    matchId,
    playerIds,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.RESULT_REJECTED_JOB, matchId, playerIds, event.createdAt);
  await publishEvent(NotificationJobType.RESULT_REJECTED_JOB, event, jobId);
};

export const publishResultAccepted = async (matchId: number, playerIds: number[], resultLoadedByTeam: number) => {
  const event: ResultAcceptedEvent = {
    matchId,
    playerIds,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.RESULT_ACCEPTED_JOB, matchId, playerIds, event.createdAt);
  await publishEvent(NotificationJobType.RESULT_ACCEPTED_JOB, event, jobId);
};

export const publishPlayerAscended = async (playerId: number, category: CATEGORY) => {
  const event: AscendDescendEvent = {
    playerId,
    category,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.PLAYER_ASCENDED_JOB, 0, playerId, event.createdAt);
  await publishEvent(NotificationJobType.PLAYER_ASCENDED_JOB, event, jobId);
};

export const publishPlayerDescended = async (playerId: number, category: CATEGORY) => {
  const event: AscendDescendEvent = {
    playerId,
    category,
    createdAt: new Date().toISOString()
  };
  const jobId = getJobId(NotificationJobType.PLAYER_DESCENDED_JOB, 0, playerId, event.createdAt);
  await publishEvent(NotificationJobType.PLAYER_DESCENDED_JOB, event, jobId);
};
