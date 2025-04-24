import prisma from "../prisma/client";
import { PlayerDTO } from "../types/playerTypes";

export const createTeam = async (teamNumber: number, players: PlayerDTO[]) => {
    return {
        teamNumber,
        players: { create: await createOrGetPlayers(players) }
    }
}

const createOrGetPlayers = async (players: PlayerDTO[]) => {
    if (!players || players.length === 0) {
        return [];
    }

    const playerPromises = players.map(async (player: PlayerDTO) => {
        // if (player.id) {
        //     return { playerId: player.id };
        // } else {
        const createdPlayer = await prisma.player.create({
            data: {
                name: player.name,
                lastName: player.lastName,
                level: player.level,
                phone: player.phone
            }
        });
        // return { playerId: createdPlayer.id };
        return createdPlayer;
        // }
    });

    return Promise.all(playerPromises);
}