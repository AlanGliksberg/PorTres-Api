import { PlayerDTO } from "./playerTypes";

export type TeamDTO = {
  teamNumber?: number;
  team1?: PlayerDTO[];
  team2?: PlayerDTO[];
};
