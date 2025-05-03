import { GENDER } from "./playerTypes";
import { TeamDTO } from "./team";

export interface MatchDTO {
  date: Date;
  time: string;
  location: string;
  category: string;
  pointsDeviation: number;
  creatorPlayerId: string;
  gender: GENDER;
  teams?: TeamDTO;
}

export type GetMatchesRequest = {
  gender?: string | string[];
  status?: string | string[];
  page: string;
  pageSize: string;
};

export type MatchFilters = {
  genders?: GENDER[];
  status?: MATCH_STATUS[];
  page: number;
  pageSize: number;
};

export enum MATCH_STATUS {
  PENDING = "PENDING",
  CLOSED = "CLOSED",
  COMPLETED = "COMPLETED"
}
