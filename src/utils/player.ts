import prisma from "../prisma/client";

export const getPlayerByUserId = async (userId: string) => {
    return await prisma.player.findUnique({
        where: {
            userId: userId,
        },
    });
}