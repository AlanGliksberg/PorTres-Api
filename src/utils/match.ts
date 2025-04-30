import { GENDER } from "../constants/gender";
import { PlayerDTO } from "../types/playerTypes";
import { createOrGetPlayers } from "./player";

export const createTeam = async (teamNumber: number, players: PlayerDTO[] | undefined, allowedGender: GENDER) => {
  return {
    teamNumber,
    players: { connect: await createOrGetPlayers(players, allowedGender) }
  };
};
