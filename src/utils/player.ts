import prisma from "../prisma/client";
import {
  GENDER,
  GetPlayersRequest,
  CATEGORY,
  PlayerDTO,
  PlayerFilters,
  CreatePlayerBody,
  UpdatePlayerBody,
  POSITION
} from "../types/playerTypes";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import { convertStringIntoArray, parsePagesFilters } from "./common";
import { Category, Prisma } from "@prisma/client";
import { getGenderById } from "./gender";

export const getPlayerByUserId = async <T extends Prisma.PlayerInclude>(
  userId: number,
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
  playerId: number,
  include?: T
): Promise<Prisma.PlayerGetPayload<{ include: T }> | null> => {
  return (await prisma.player.findUnique({
    where: {
      id: playerId
    },
    include
  })) as any;
};

export const createOrGetPlayers = async (players: PlayerDTO[] | undefined, allowedGenderId: number) => {
  if (!players || players.length === 0) {
    return [];
  }

  const playerPromises = players.map(async (player: PlayerDTO) => {
    return await createOrGetPlayer(player, allowedGenderId);
  });

  return Promise.all(playerPromises);
};

export const createOrGetPlayer = async (player: PlayerDTO, allowedGenderId: number) => {
  if (player.id) {
    const existingPlayer: Prisma.PlayerGetPayload<{
      include: { gender: true };
    }> | null = await getPlayerById(player.id, { gender: true });
    if (!existingPlayer) throw new CustomError("No player exists with id: " + player.id, ErrorCode.NO_PLAYER);
    await verifyGender(allowedGenderId, existingPlayer.gender?.code as GENDER);
    return { id: player.id };
  }

  await verifyGenderById(allowedGenderId, player.genderId);
  const createdPlayer = await createTemporalPlayer(player);
  return { id: createdPlayer.id };
};

export const createPlayer = async (name: string, lastName: string, data: CreatePlayerBody, userId: number) => {
  const category = await calculatePlayerCategory(data);
  const rankingPoints = category.initialPoints;

  return await prisma.player.create({
    data: {
      firstName: name,
      lastName: lastName,
      genderId: data.genderId,
      phone: data.phone,
      categoryId: category.id,
      rankingPoints,
      positionId: data.positionId,
      userId
    }
  });
};

export const createTemporalPlayer = async (player: PlayerDTO) => {
  const category = await prisma.category.findUnique({
    where: { id: player.categoryId }
  });

  return await prisma.player.create({
    data: {
      firstName: player.firstName,
      lastName: player.lastName,
      categoryId: player.categoryId,
      rankingPoints: category?.initialPoints,
      genderId: player.genderId,
      phone: player.phone,
      positionId: player.positionId
    }
  });
};

const calculatePlayerCategory = async (data: CreatePlayerBody): Promise<Category> => {
  let where;
  if (data.knowsCategory) where = { id: data.categoryId };
  else {
    let categoryCode;
    if (data.answers && data.answers.length > 0) {
      const answers = await prisma.questionAnswer.findMany({
        where: {
          id: { in: data.answers }
        }
      });

      const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0);
      const averagePoints = totalPoints / answers.length;

      if (averagePoints <= 20) {
        categoryCode = CATEGORY.C9;
      } else if (averagePoints <= 28) {
        categoryCode = CATEGORY.C8;
      } else {
        categoryCode = CATEGORY.C7;
      }
    }
    where = { code: categoryCode };
  }

  const category = await prisma.category.findUnique({
    where
  });

  if (!category) throw new CustomError("Catergoría no encontrada", ErrorCode.CATEGORY_INVALID);

  return category;
};

export const verifyGender = async (allowedGenderId: number, playerGender: GENDER | undefined) => {
  const allowedGender = await getGenderById(allowedGenderId);
  if (allowedGender?.code === GENDER.MIXTO || !playerGender) return;

  if (!allowedGender || playerGender !== allowedGender.code)
    throw new CustomError(
      `Invalid gender | Allowed gender: ${allowedGender?.name} | Gender: ${playerGender}`,
      ErrorCode.INVALID_GENDER
    );
};

export const verifyGenderById = async (allowedGenderId: number, playerGenderId: number | undefined) => {
  if (!playerGenderId) return;
  const gender = await getGenderById(playerGenderId);
  await verifyGender(allowedGenderId, gender!.code as GENDER);
};

export const parsePlayerFilters = (filters: GetPlayersRequest): PlayerFilters => {
  const { page, pageSize, gender, name, category, position, pointsDeviation } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  const genders = convertStringIntoArray<GENDER>(gender);
  const positions = convertStringIntoArray<POSITION>(position);
  const categories = convertStringIntoArray<CATEGORY>(category);
  const pointsDeviationNumber = parseInt(pointsDeviation!, 10) || undefined;

  return {
    page: pageNumber,
    pageSize: pageSizeNumber,
    name,
    genders,
    categories,
    positions,
    pointsDeviation: pointsDeviationNumber
  };
};

export const getDBFilter = (filters: PlayerFilters) => {
  const where: Prisma.PlayerWhereInput = {};
  const { genders, name, categories, positions, pointsDeviation } = filters;
  if (genders && genders.length > 0) where.gender = { code: { in: genders } };
  if (categories && categories.length > 0) where.category = { code: { in: categories } };
  if (positions && positions.length > 0) where.position = { code: { in: positions } };
  if (name) {
    const names = name.trim().split(" ").filter(Boolean);
    if (names.length === 1) {
      const trimmedName = name.trim();
      where.OR = [
        {
          firstName: {
            contains: trimmedName,
            mode: "insensitive"
          }
        },
        {
          lastName: {
            contains: trimmedName,
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

export const validateCreatePlayerBody = (body: CreatePlayerBody) => {
  if (
    !body.genderId ||
    !Number(body.genderId) ||
    !body.positionId ||
    !Number(body.positionId) ||
    !((body.knowsCategory && body.categoryId && Number(body.categoryId)) || (!body.knowsCategory && body.answers))
  )
    throw new CustomError("Body incorrecto", ErrorCode.CREATE_PLAYER_INCORRECT_BODY);
};

export const validateUpdatePlayerBody = (body: UpdatePlayerBody) => {
  if (!body.firstName || body.firstName.trim().length === 0)
    throw new CustomError("El nombre es requerido y no puede estar vacío", ErrorCode.CREATE_PLAYER_INCORRECT_BODY);

  if (!body.lastName || body.lastName.trim().length === 0)
    throw new CustomError("El apellido es requerido y no puede estar vacío", ErrorCode.CREATE_PLAYER_INCORRECT_BODY);

  if (!body.positionId || !Number(body.positionId))
    throw new CustomError(
      "El ID de posición es requerido y debe ser un número válido",
      ErrorCode.CREATE_PLAYER_INCORRECT_BODY
    );
};

export const getCategoryById = async (id: number): Promise<Category> => {
  return (await prisma.category.findUnique({ where: { id } })) as Category;
};

export const getOneCategoryUp = async (category: Category) => {
  return (await prisma.category.findFirst({
    where: {
      genderId: category.genderId,
      order: category.order - 1
    }
  })) as Category;
};

export const getOneCategoryDown = async (category: Category) => {
  return (await prisma.category.findFirst({
    where: {
      genderId: category.genderId,
      order: category.order + 1
    }
  })) as Category;
};
