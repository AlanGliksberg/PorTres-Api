export type PlayerAddedToMatchEvent = {
  matchId: number;
  playerId: number;
  addedByPlayerId: number;
  teamNumber: number;
  createdAt: string;
};

export type ProcessNotificationIntentJobData = {
  intentId: number;
};

export type NotificationJobData = PlayerAddedToMatchEvent | ProcessNotificationIntentJobData;
