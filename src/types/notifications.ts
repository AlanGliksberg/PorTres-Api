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
  playerId: number;
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

export type ProcessNotificationIntentJobData = {
  intentId: number;
};

export type NotificationJobData = any;
