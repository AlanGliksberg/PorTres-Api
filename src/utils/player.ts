import prisma from "../prisma/client";
import { GENDER, GetPlayersRequest, PlayerAnswersDTO, PlayerDTO, PlayerFilters } from "../types/playerTypes";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import { convertStringIntoArray, parsePagesFilters } from "./common";
import { Prisma } from "@prisma/client";

export const getPlayerByUserId = async (userId: string) => {
  return await prisma.player.findUnique({
    where: {
      userId: userId
    }
  });
};

export const getPlayerById = async (playerId: string) => {
  return await prisma.player.findUnique({
    where: {
      id: playerId
    }
  });
};

const getPlayerByPhone = async (phone: string) => {
  return await prisma.player.findUnique({
    where: {
      phone
    }
  });
};

export const createOrGetPlayers = async (players: PlayerDTO[] | undefined, allowedGender: GENDER) => {
  if (!players || players.length === 0) {
    return [];
  }

  const playerPromises = players.map(async (player: PlayerDTO) => {
    if (player.id) {
      const existingPlayer = await getPlayerById(player.id);
      if (!existingPlayer) throw new CustomError("No player", ErrorCode.NO_PLAYER);
      verifyGender(allowedGender, existingPlayer.gender as GENDER);
      return { id: player.id };
    }

    //TODO - agregar validaciones de campos
    // firstName - lastName - level
    const createdPlayer = await createTemporalPlayer(player);
    return { id: createdPlayer.id };
  });

  return Promise.all(playerPromises);
};

export const createPlayer = async (player: PlayerDTO, answers: PlayerAnswersDTO, userId: string) => {
  const level = calculatePlayerLevel(answers);
  const rankingPoints = calculateInitialRankingPoints(level!); // TODO - calcular cantidad según level

  return await prisma.player.create({
    data: {
      firstName: player.firstName,
      lastName: player.lastName,
      gender: player.gender,
      phone: player.phone,
      level: level,
      rankingPoints,
      userId
    }
  });
};

export const createTemporalPlayer = async (player: PlayerDTO) => {
  return await prisma.player.create({
    data: {
      firstName: player.firstName,
      lastName: player.lastName,
      level: player.level
    }
  });
};

const calculatePlayerLevel = (answers: PlayerAnswersDTO): string => {
  if (answers.knowsLevel) return answers.level;
  return "C5"; // TODO - calcular nivel según respuestas
};

const calculateInitialRankingPoints = (level: string) => {
  return 500; // TODO - calcular puntos según nivel
};

function verifyGender(allowedGender: GENDER, playerGender: GENDER | undefined) {
  if (allowedGender === GENDER.X || !playerGender) return;

  if (playerGender !== allowedGender)
    throw new CustomError(
      `Invalid gender | Allowed gender: ${allowedGender} | Gender: ${playerGender}`,
      ErrorCode.INVALID_GENDER
    );
}

export const parsePlayerFilters = (filters: GetPlayersRequest): PlayerFilters => {
  const { page, pageSize, gender, name, level, pointsDeviation } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  let matchGenders = convertStringIntoArray<GENDER>(gender);
  const pointsDeviationNumber = parseInt(pointsDeviation!, 10) || undefined;

  return {
    page: pageNumber,
    pageSize: pageSizeNumber,
    genders: matchGenders,
    name,
    level,
    pointsDeviation: pointsDeviationNumber
  };
};

export const getDBFilter = (filters: PlayerFilters) => {
  // TODO - filtro por nivel
  const where: Prisma.PlayerWhereInput = {};
  const { genders, name, level, pointsDeviation } = filters;
  if (genders && genders.length > 0) where.gender = { in: genders };
  if (name) {
    const names = name.trim().split(" ").filter(Boolean);
    if (names.length === 1) {
      where.OR = [
        {
          firstName: {
            contains: name,
            mode: "insensitive"
          }
        },
        {
          lastName: {
            contains: name,
            mode: "insensitive"
          }
        }
      ];
    } else {
      where.AND = names.map((n) => ({
        OR: [{ firstName: { contains: n, mode: "insensitive" } }, { lastName: { contains: n, mode: "insensitive" } }]
      }));
    }
  }

  return where;
};
