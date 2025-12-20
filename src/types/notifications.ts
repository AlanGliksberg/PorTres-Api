import { MATCH_STATUS } from "./matchTypes";
import { CATEGORY } from "./playerTypes";

export type PlayerAddedToMatchEvent = {
  matchId: number;
  playerId: number;
  addedByPlayerId: number;
  teamNumber: number;
  createdAt: string;
};

export type PlayerAppliedToMatchEvent = {
  matchId: number;
  playerAppliedId: number;
  playerOwnerId: number;
  teamNumber?: number;
  createdAt: string;
};

export type MatchCancelledEvent = {
  matchId: number;
  playerId: number;
  createdAt: string;
};

export type PlayerRemovedFromMatchEvent = {
  matchId: number;
  deletedPlayerId: number;
  deletedById: number;
  creatorPlayerId: number;
  playerIds: number[];
  status: MATCH_STATUS;
  createdAt: string;
};

export type ApplicationRejectedEvent = {
  matchId: number;
  playerId: number;
  createdAt: string;
};

export type ApplicationAcceptedEvent = {
  matchId: number;
  playerId: number;
  createdAt: string;
};

export type MatchConfirmedEvent = {
  matchId: number;
  playerIds: number[];
  creatorPlayerId: number;
  dateTime: Date;
  createdAt: string;
};

export type MatchClosedEvent = {
  matchId: number;
};

export type ResultCreatedEvent = {
  matchId: number;
  playerIds: number[];
  createdAt: string;
};

export type ResultRejectedEvent = {
  matchId: number;
  playerIds: number[];
  createdAt: string;
};

export type ResultAcceptedEvent = {
  matchId: number;
  playerIds: number[];
  createdAt: string;
};

export type AscendDescendEvent = {
  playerId: number;
  category: CATEGORY;
  createdAt: string;
};

export type ProcessNotificationIntentJobData = {
  intentId: number;
};

export type NotificationJobData = any;

export type BroadcastPushMessage = {
  title: string;
  body: string;
};

export type BroadcastPushBody = {
  messages: BroadcastPushMessage[];
};

export type BroadcastMessageInput = Partial<BroadcastPushMessage> & { message?: string };
export type BroadcastBodyInput = BroadcastMessageInput & { messages?: BroadcastMessageInput[] };
