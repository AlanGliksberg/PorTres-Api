import { User } from "@prisma/client";
import { PlayerAnswersDTO, PlayerDTO } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getPlayerByUserId } from "../../utils/player";

export const createPlayer = async (answers: PlayerAnswersDTO, user: User) => {
    let existingPlayer = await getPlayerByUserId(user.id);
    if (existingPlayer) return existingPlayer;

    const player: PlayerDTO = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: answers.gender,
        phone: answers.phone
    }

    return await createPlayerDB(player, answers, user.id);
}