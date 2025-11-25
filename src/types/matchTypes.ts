import { PageFilterNumber, PageFilterString } from "./common";
import { TeamDTO } from "./team";
import { Match, Team, Player, Set, MatchStatus, Application, Gender } from "@prisma/client";

export interface MatchDto {
  location?: string;
  description?: string;
  date: string;
  time: string;
  duration?: number;
  genderId: number;
  categoryId: number;
  teams?: TeamDTO;
  pointsDeviation?: number;
  creatorPlayerId?: number;
  clubId?: number;
}

export interface UpdateMatchDto {
  location?: string;
  description?: string;
  date?: Date;
  time?: string;
  duration?: number;
  genderId?: number;
  categoryId?: number;
  pointsDeviation?: number;
  teams?: TeamDTO;
}

export interface UpdateMatchResultDto {
  matchId: number;
  sets: [number, number][];
}

export interface AcceptResultDto {
  matchId: number;
}

export interface CreateMatchWithResultDto {
  location?: string;
  date: string;
  time: string;
  gender: number;
  category: number;
  teams: TeamDTO;
  sets: [number, number][];
  matchClubId?: number;
}

export type GetMatchesRequest = {
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  gender?: string | string[];
  category?: string | string[];
  status?: string | string[];
  duration?: string | string[];
} & PageFilterString;

export type MatchFilters = {
  description?: string;
  dateFrom?: Date;
  dateTo?: Date;
  timeFrom?: Date;
  timeTo?: Date;
  genders?: number[];
  categories?: number[];
  status?: number[];
  duration?: number[];
} & PageFilterNumber;

export type AddPlayerToMatchRequest = {
  matchId: number;
  teamNumber: number;
  playerId?: number;
  firstName?: string;
  lastName?: string;
  genderId?: number;
  categoryId?: number;
  phone?: string;
  positionId?: number;
};

export type DeletePlayerFromMatchRequest = {
  matchId: number;
  playerId: number;
};

export enum MATCH_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED"
}

export type MatchWithFullDetails = Match & {
  teams: (Team & {
    players: Player[];
  })[];
  players?: Player[];
  sets: Set[];
  status: MatchStatus;
  applications: Application[];
  gender: Gender;
};
