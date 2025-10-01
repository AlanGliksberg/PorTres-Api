import { Player, Team } from "@prisma/client";
import { PlayerDTO } from "./playerTypes";

export type TeamDTO = {
  team1?: PlayerDTO[];
  team2?: PlayerDTO[];
};

export type TeamWithPlayers = Team & {
  players: Player[];
};
