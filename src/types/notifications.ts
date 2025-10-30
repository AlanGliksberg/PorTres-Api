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

export type ProcessNotificationIntentJobData = {
  intentId: number;
};

export type NotificationJobData = any;
