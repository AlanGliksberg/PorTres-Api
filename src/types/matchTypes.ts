import { PageFilterNumber, PageFilterString } from "./common";
import { GENDER } from "./playerTypes";
import { TeamDTO } from "./team";

export interface MatchDto {
  location: string;
  description?: string;
  date: Date;
  time: string;
  duration: number;
  genderId: number;
  categoryId: number;
  teams?: TeamDTO;
  pointsDeviation: number;
  creatorPlayerId: number;
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
  team1Set1?: number;
  team1Set2?: number;
  team1Set3?: number;
  team2Set1?: number;
  team2Set2?: number;
  team2Set3?: number;
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
