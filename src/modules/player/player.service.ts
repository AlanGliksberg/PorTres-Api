import { User } from "@prisma/client";
import { PlayerAnswersDTO, PlayerDTO, PlayerFilters } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getDBFilter, getPlayerByUserId } from "../../utils/player";
import prisma from "../../prisma/client";

export const createPlayer = async (answers: PlayerAnswersDTO, user: User) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) return existingPlayer;

  const player: PlayerDTO = {
    firstName: user.firstName,
    lastName: user.lastName,
    genderId: answers.genderId,
    phone: answers.phone
  };

  return await createPlayerDB(player, answers, user.id);
};

export const getPlayers = async (filters: PlayerFilters) => {
  const { page, pageSize } = filters;
  return await prisma.player.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: getDBFilter(filters)
  });
};
