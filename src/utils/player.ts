import prisma from "../prisma/client";
import { PlayerDTO } from "../types/playerTypes";

export const getPlayerByUserId = async (userId: string) => {
    return await prisma.player.findUnique({
        where: {
            userId: userId,
        },
    });
}

export const getPlayerById = async (playerId: string) => {
    return await prisma.player.findUnique({
        where: {
            id: playerId,
        },
    });
}

export const createOrGetPlayers = async (players: PlayerDTO[]) => {
    if (!players || players.length === 0) {
        return [];
    }

    const playerPromises = players.map(async (player: PlayerDTO) => {
        if (player.id) {
            return (await getPlayerById(player.id))!;
        } else {
            const createdPlayer = await prisma.player.create({
                data: {
                    name: player.name,
                    lastName: player.lastName,
                    level: player.level,
                    phone: player.phone
                }
            });
            return createdPlayer;
        }
    });

    return Promise.all(playerPromises);
}