import { PageFilterNumber, PageFilterString } from "./common";
import { GENDER } from "./playerTypes";
import { TeamDTO } from "./team";

export interface MatchDTO {
  date: Date;
  time: string;
  location: string;
  description?: string;
  category: string;
  pointsDeviation: number;
  creatorPlayerId: string;
  gender: GENDER;
  teams?: TeamDTO;
  duration: number;
}

export type GetMatchesRequest = {
  gender?: string | string[];
  status?: string | string[];
  createdBy?: string;
  isPlayer?: string;
} & PageFilterString;

export type MatchFilters = {
  genders?: GENDER[];
  status?: MATCH_STATUS[];
  createdBy?: boolean;
  isPlayer?: boolean;
} & PageFilterNumber;

export enum MATCH_STATUS {
  PENDING = "PENDING",
  CLOSED = "CLOSED",
  COMPLETED = "COMPLETED"
}
