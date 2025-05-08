import { PlayerDTO } from "./playerTypes";

export type TeamDTO = {
  teamNumber?: 1 | 2;
  team1?: PlayerDTO[];
  team2?: PlayerDTO[];
};
