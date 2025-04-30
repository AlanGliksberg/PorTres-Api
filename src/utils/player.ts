import { GENDER } from "../constants/gender";
import prisma from "../prisma/client";
import { PlayerAnswersDTO, PlayerDTO } from "../types/playerTypes";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";

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

    verifyGender(allowedGender, player.gender);

    if (player.phone) {
      const existingPlayer = await getPlayerByPhone(player.phone);
      if (existingPlayer) return { id: existingPlayer.id };
    }
    const createdPlayer = await createPlayer(player);
    return { id: createdPlayer.id };
  });

  return Promise.all(playerPromises);
};

export const createPlayer = async (player: PlayerDTO, answers?: PlayerAnswersDTO, userId?: string) => {
  let level = player.level;
  if (answers) {
    level = calculatePlayerLevel(answers);
  }

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
