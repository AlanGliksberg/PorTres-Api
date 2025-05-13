import { Application, Match, MatchStatus, Player, Team } from "@prisma/client";

export type CreateApplicationBody = {
  matchId: string;
  teamNumber: 1 | 2;
  message?: string;
  phone?: string;
};

export type ApplicationWithRelations =
  | (Application & {
      match?: Match & {
        status: MatchStatus;
        teams: (Team & { players: Player[] })[];
      };
      player?: Player;
    })
  | null;
