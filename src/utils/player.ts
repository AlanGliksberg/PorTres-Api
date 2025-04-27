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

const getPlayerByPhone = async (phone: string) => {
    return await prisma.player.findUnique({
        where: {
            phone
        },
    });
}

export const createOrGetPlayers = async (players: PlayerDTO[]) => {
    if (!players || players.length === 0) {
        return [];
    }

    const playerPromises = players.map(async (player: PlayerDTO) => {
        if (player.id) {
            return { id: (await getPlayerById(player.id))!.id };
        }
        if (player.phone) {
            const existingPlayer = await getPlayerByPhone(player.phone);
            if (existingPlayer) return { id: existingPlayer.id };
        }
        const createdPlayer = await createPlayer(player)
        return { id: createdPlayer.id };
    });

    return Promise.all(playerPromises);
}

export const createPlayer = async (player: PlayerDTO, userId?: string) => {
    return await prisma.player.create({
        data: {
            name: player.name,
            lastName: player.lastName,
            level: player.level,
            phone: player.phone,
            rankingPoints: 500, //TODO - calcular puntos,
            userId
        }
    });
}