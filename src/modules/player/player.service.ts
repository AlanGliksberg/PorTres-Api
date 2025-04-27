import { User } from "@prisma/client";
import { PlayerDTO } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getPlayerByUserId } from "../../utils/player";

export const createPlayer = async (data: PlayerDTO, user: User) => {
    let player = await getPlayerByUserId(user.id);
    if (player) return player;

    player = await createPlayerDB(data, user.id);

    return player
}