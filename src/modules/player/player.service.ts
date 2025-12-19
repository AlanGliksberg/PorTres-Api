import { SocialPlatform, User } from "@prisma/client";
import * as matchService from "../match/match.service";
import {
  CreatePlayerBody,
  UpdatePlayerBody,
  GENDER,
  PlayerFilters,
  SaveExpoPushTokenBody
} from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getDBFilter, getPlayerByUserId } from "../../utils/player";
import prisma from "../../prisma/client";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { MATCH_STATUS } from "../../types/matchTypes";
import { deletePlayerFromMatch } from "../match/match.service";
import { deletePlayerProfilePhoto, uploadPlayerProfilePhoto } from "../../utils/storage";
import { formatName } from "../../utils/common";

export const createPlayer = async (data: CreatePlayerBody, user: User, profilePhotoFile?: Express.Multer.File) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) {
    if (profilePhotoFile) {
      await updatePlayerPhoto(user, profilePhotoFile);
    }
    return existingPlayer;
  }

  const player = await createPlayerDB(user.firstName, user.lastName, data, user);

  if (profilePhotoFile) {
    await updatePlayerPhoto(user, profilePhotoFile);
  }

  return player;
};

export const updatePlayerPhoto = async (user: User, profilePhotoFile: Express.Multer.File) => {
  const photoUrl = await uploadPlayerProfilePhoto(profilePhotoFile, user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { photoUrl }
  });

  return photoUrl;
};

export const deletePlayerPhoto = async (user: User) => {
  await deletePlayerProfilePhoto(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { photoUrl: null }
  });

  return { deleted: true };
};

export const updatePlayer = async (data: UpdatePlayerBody, user: User) => {
  const updateData: {
    firstName: string;
    lastName: string;
    phone: string | null;
    positionId: number;
  } = {
    firstName: formatName(data.firstName),
    lastName: formatName(data.lastName),
    phone: data.phone?.trim() || null,
    positionId: data.positionId
  };

  return await prisma.player.update({
    where: { userId: user.id },
    data: updateData
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

  let hasPlayedMatches = false;
  let createdMatches = [];
  if (playerId) {
    hasPlayedMatches = !!(await matchService.getPlayedMatchesCount(playerId));
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

    createdMatches = await prisma.match.findMany({
      where: {
        creatorPlayerId: playerId
      }
    });
    for (const match of createdMatches) {
      await matchService.cancelMatch(match.id, playerId);
    }
  }

  await prisma.$transaction(async (tx) => {
    if (playerId) {
      await tx.expoPushToken.deleteMany({
        where: { playerId }
      });

      if (hasPlayedMatches) {
        await tx.player.update({
          where: { id: playerId },
          data: {
            userId: null
          }
        });
      } else if (createdMatches.length === 0 && user.socialPlatform !== SocialPlatform.APPLE) {
        // Si el usuario se creó la cuenta a través de Apple, no se elimina ya que se necesitan sus datos si se crea nuevamente la cuenta
        await tx.player.delete({
          where: { id: playerId }
        });
      }
    }

    await tx.user.delete({
      where: { id: userId }
    });
  });

  await deletePlayerProfilePhoto(userId);

  return { userId };
};
