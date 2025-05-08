import { PageFilterNumber, PageFilterString } from "./common";

export type PlayerDTO = {
  id?: string;
  firstName: string;
  lastName: string;
  level?: string;
  phone?: string;
  gender: GENDER;
};

export type CreatePlayerRequest = PlayerAnswersDTO;

export type PlayerAnswersDTO = {
  level: string;
  phone?: string;
  gender: GENDER;
  knowsLevel: boolean;
};

export enum GENDER {
  M = "Male",
  F = "Female",
  X = "Mixed"
}

export type GetPlayersRequest = {
  gender?: string | string[];
  name?: string;
  level?: string;
  pointsDeviation?: string;
} & PageFilterString;

export type PlayerFilters = {
  genders?: GENDER[];
  name?: string;
  level?: string;
  pointsDeviation?: number;
} & PageFilterNumber;
