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
