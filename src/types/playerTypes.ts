import { PageFilterNumber, PageFilterString } from "./common";

export type PlayerDTO = {
  id?: number;
  firstName: string;
  lastName: string;
  categoryId?: number;
  phone?: string;
  genderId?: number;
};

export type CreatePlayerBody = {
  categoryId: number;
  phone?: string;
  genderId: number;
  knowsCategory: boolean;
  positionId: number;
  answers: PlayerAnswer[];
};

export type PlayerAnswer = {};

export enum GENDER {
  C = "C",
  D = "D",
  X = "X"
}

export type GetPlayersRequest = {
  gender?: string | string[];
  name?: string;
  category?: string;
  pointsDeviation?: string;
} & PageFilterString;

export type PlayerFilters = {
  genders?: GENDER[];
  name?: string;
  categoryId?: string;
  pointsDeviation?: number;
} & PageFilterNumber;

export enum CATEGORY {
  C1 = "C1",
  C2 = "C2",
  C3 = "C3",
  C4 = "C4",
  C5 = "C5",
  C6 = "C6",
  C7 = "C7",
  C8 = "C8",
  C9 = "C9",
  D1 = "D1",
  D2 = "D2",
  D3 = "D3",
  D4 = "D4",
  D5 = "D5",
  D6 = "D6",
  D7 = "D7",
  D8 = "D8",
  D9 = "D9",
  M7 = "M7",
  M8 = "M8",
  M9 = "M9",
  M10 = "M10",
  M11 = "M11",
  M12 = "M12",
  M13 = "M13",
  M14 = "M14",
  M15 = "M15"
}
