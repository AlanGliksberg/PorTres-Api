import { User } from "@prisma/client";
import prisma from "../../prisma/client";
import { PlayerDTO } from "../../types/playerTypes";
import { getPlayerByUserId } from "../../utils/player";

export const createPlayer = async (data: PlayerDTO, user: User) => {
    let player = await getPlayerByUserId(user.id);
    if (player) return player;

    player = await prisma.player.create({
        data: {
            name: user.firstName,
            lastName: user.lastName,
            level: data.level,
            phone: data.phone || null,
            userId: user.id,
            rankingPoints: 500
        },
    });

    return player
}