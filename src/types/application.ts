import { Application, ApplicationStatus, Match, MatchStatus, Player, Team } from "@prisma/client";

export type CreateApplicationBody = {
  matchId: number;
  teamNumber?: 1 | 2;
  message?: string;
  phone?: string;
};

export type ApplicationWithRelations =
  | (Application & {
      match?: Match & {
        status: MatchStatus;
        teams: (Team & { players: Player[] })[];
      };
      status?: ApplicationStatus;
      player?: Player;
    })
  | null;

export type AcceptApplicationBody = {
  teamNumber: 1 | 2;
};

export enum APPLICATION_STATUS {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}
