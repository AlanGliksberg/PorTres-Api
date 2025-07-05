import { User } from "@prisma/client";
import { CreatePlayerBody, UpdatePlayerBody, GENDER, PlayerDTO, PlayerFilters } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getDBFilter, getPlayerByUserId } from "../../utils/player";
import prisma from "../../prisma/client";

export const createPlayer = async (data: CreatePlayerBody, user: User) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) return existingPlayer;

  return await createPlayerDB(user.firstName, user.lastName, data, user.id);
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
    orderBy: {
      code: "asc"
    }
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
