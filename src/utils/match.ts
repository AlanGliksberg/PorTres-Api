import { PlayerDTO } from "../types/playerTypes";
import { createOrGetPlayers } from "./player";

export const createTeam = async (teamNumber: number, players: PlayerDTO[]) => {
    return {
        teamNumber,
        players: { create: await createOrGetPlayers(players) }
    }
}