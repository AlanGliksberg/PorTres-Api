import { User } from "@prisma/client";
import { CreatePlayerBody, GENDER, PlayerDTO, PlayerFilters } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getDBFilter, getPlayerByUserId } from "../../utils/player";
import prisma from "../../prisma/client";

export const createPlayer = async (answers: CreatePlayerBody, user: User) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) return existingPlayer;

  const player: PlayerDTO = {
    firstName: user.firstName,
    lastName: user.lastName,
    genderId: answers.genderId,
    phone: answers.phone || user.phoneNumber
  };

  return await createPlayerDB(player.firstName, player.lastName, answers, user.id);
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
    where
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
