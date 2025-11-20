import { User } from "@prisma/client";
import {
  CreatePlayerBody,
  UpdatePlayerBody,
  GENDER,
  PlayerFilters,
  SaveExpoPushTokenBody
} from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getDBFilter, getPlayerByUserId } from "../../utils/player";
import prisma from "../../prisma/client";
import { getUserSelect } from "../../utils/auth";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { MATCH_STATUS } from "../../types/matchTypes";
import { deletePlayerFromMatch } from "../match/match.service";

export const createPlayer = async (data: CreatePlayerBody, user: User) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) return existingPlayer;

  return await createPlayerDB(user.firstName, user.lastName, data, user);
};

export const updatePlayer = async (data: UpdatePlayerBody, user: User) => {
  const updateData: {
    firstName: string;
    lastName: string;
    phone: string | null;
    positionId: number;
  } = {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone?.trim() || null,
    positionId: data.positionId
  };

  return await prisma.player.update({
    where: { userId: user.id },
    data: updateData
  });
};

export const getCurrentPlayer = async (user: User) => {
  return await getPlayerByUserId(user.id, {
    position: true,
    category: true,
    gender: true,
    user: getUserSelect()
  });
};

export const getPlayers = async (filters: PlayerFilters) => {
  const { page, pageSize } = filters;
  const where = getDBFilter(filters);
  where.userId = {
    not: null
  };

  return await prisma.player.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where,
    include: {
      position: true,
      category: true,
      gender: true,
      user: true
    },
    orderBy: {
      firstName: "asc"
    }
  });
};

export const getGenders = async (filterBoth: boolean) => {
  const where = filterBoth ? { code: { not: GENDER.MIXTO } } : {};
  return await prisma.gender.findMany({
    where,
    orderBy: {
      order: "asc"
    }
  });
};

export const getPositions = async () => {
  return await prisma.playerPosition.findMany({
    orderBy: {
      order: "asc"
    }
  });
};

export const getCategories = async (filterBoth: boolean) => {
  const where = filterBoth
    ? {
        gender: {
          code: {
            not: GENDER.MIXTO
          }
        }
      }
    : {};
  return await prisma.category.findMany({
    where,
    orderBy: [{ order: "asc" }, { code: "asc" }]
  });
};

export const getQuestions = async () => {
  return await prisma.question.findMany({
    orderBy: {
      code: "asc"
    },
    include: {
      answers: {
        orderBy: {
          points: "asc"
        }
      },
      type: true
    }
  });
};

export const saveExpoPushToken = async (data: SaveExpoPushTokenBody, user: User) => {
  const player = await getPlayerByUserId(user.id);
  if (!player) {
    throw new CustomError("Jugador no encontrado", ErrorCode.NO_PLAYER);
  }

  const token = data.token.trim();
  const deviceType = data.deviceType?.trim() || null;

  return await prisma.expoPushToken.upsert({
    where: { token },
    update: {
      playerId: player.id,
      deviceType,
      lastSeenAt: new Date()
    },
    create: {
      playerId: player.id,
      token,
      deviceType
    }
  });
};

export const deleteUserAccount = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { player: true }
  });

  if (!user) {
    throw new CustomError("Usuario no encontrado", ErrorCode.USER_NOT_FOUND);
  }

  const playerId = user.player?.id;

  if (playerId) {
    const activeMatches = await prisma.match.findMany({
      where: {
        players: {
          some: { id: playerId }
        },
        status: {
          code: {
            in: [MATCH_STATUS.PENDING, MATCH_STATUS.COMPLETED]
          }
        }
      },
      select: {
        id: true
      }
    });

    for (const match of activeMatches) {
      await deletePlayerFromMatch({ matchId: match.id, playerId }, playerId);
    }
  }

  await prisma.$transaction(async (tx) => {
    if (playerId) {
      await tx.expoPushToken.deleteMany({
        where: { playerId }
      });

      await tx.player.update({
        where: { id: playerId },
        data: {
          userId: null
        }
      });
    }

    await tx.user.delete({
      where: { id: userId }
    });
  });

  return { userId };
};
