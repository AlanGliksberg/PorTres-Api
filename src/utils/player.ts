import prisma from "../prisma/client";
import { GENDER, GetPlayersRequest, CATEGORY, PlayerAnswersDTO, PlayerDTO, PlayerFilters } from "../types/playerTypes";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import { convertStringIntoArray, parsePagesFilters } from "./common";
import { Category, Prisma } from "@prisma/client";
import { getGenderById } from "./gender";

export const getPlayerByUserId = async <T extends Prisma.PlayerInclude>(
  userId: string,
  include?: T
): Promise<Prisma.PlayerGetPayload<{ include: T }> | null> => {
  return (await prisma.player.findUnique({
    where: {
      userId: userId
    },
    include
  })) as any;
};

export const getPlayerById = async <T extends Prisma.PlayerInclude>(
  playerId: string,
  include?: T
): Promise<Prisma.PlayerGetPayload<{ include: T }> | null> => {
  return (await prisma.player.findUnique({
    where: {
      id: playerId
    },
    include
  })) as any;
};

export const createOrGetPlayers = async (players: PlayerDTO[] | undefined, allowedGenderId: string) => {
  if (!players || players.length === 0) {
    return [];
  }

  const playerPromises = players.map(async (player: PlayerDTO) => {
    if (player.id) {
      const existingPlayer: Prisma.PlayerGetPayload<{
        include: { gender: true };
      }> | null = await getPlayerById(player.id, { gender: true });
      if (!existingPlayer) throw new CustomError("No player exists with id: " + player.id, ErrorCode.NO_PLAYER);
      await verifyGender(allowedGenderId, existingPlayer.gender?.code as GENDER);
      return { id: player.id };
    }

    //TODO - agregar validaciones de campos
    // firstName - lastName - category
    const createdPlayer = await createTemporalPlayer(player);
    return { id: createdPlayer.id };
  });

  return Promise.all(playerPromises);
};

export const createPlayer = async (name: string, lastName: string, answers: PlayerAnswersDTO, userId: string) => {
  const category = await calculatePlayerCategory(answers);
  const rankingPoints = category.initialPoints;

  return await prisma.player.create({
    data: {
      firstName: name,
      lastName: lastName,
      genderId: answers.genderId,
      phone: answers.phone,
      categoryId: category.id,
      rankingPoints,
      positionId: answers.positionId,
      userId
    }
  });
};

export const createTemporalPlayer = async (player: PlayerDTO) => {
  return await prisma.player.create({
    data: {
      firstName: player.firstName,
      lastName: player.lastName,
      categoryId: player.categoryId
    }
  });
};

const calculatePlayerCategory = async (answers: PlayerAnswersDTO): Promise<Category> => {
  let where;
  if (answers.knowsCategory) where = { id: answers.categoryId };
  else {
    let categoryCode = CATEGORY.C5;
    where = { code: categoryCode }; // TODO - calcular nivel según respuestas
  }

  const category = await prisma.category.findUnique({
    where
  });

  if (!category) throw new CustomError("Nivel inválido", ErrorCode.CATEGORY_INVALID);

  return category;
};

const verifyGender = async (allowedGenderId: string, playerGender: GENDER | undefined) => {
  const allowedGender = await getGenderById(allowedGenderId);
  if (allowedGender?.code === GENDER.X || !playerGender) return;

  if (!allowedGender || playerGender !== allowedGender.code)
    throw new CustomError(
      `Invalid gender | Allowed gender: ${allowedGenderId} | Gender: ${playerGender}`,
      ErrorCode.INVALID_GENDER
    );
};

export const parsePlayerFilters = (filters: GetPlayersRequest): PlayerFilters => {
  const { page, pageSize, gender, name, category, pointsDeviation } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  let matchGenders = convertStringIntoArray<GENDER>(gender);
  const pointsDeviationNumber = parseInt(pointsDeviation!, 10) || undefined;

  return {
    page: pageNumber,
    pageSize: pageSizeNumber,
    genders: matchGenders,
    name,
    categoryId: category,
    pointsDeviation: pointsDeviationNumber
  };
};

export const getDBFilter = (filters: PlayerFilters) => {
  // TODO - filtro por nivel
  const where: Prisma.PlayerWhereInput = {};
  const { genders, name, categoryId, pointsDeviation } = filters;
  if (genders && genders.length > 0) where.gender = { code: { in: genders } };
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
