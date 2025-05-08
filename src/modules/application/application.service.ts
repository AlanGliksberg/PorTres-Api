import { User } from "@prisma/client";
import prisma from "../../prisma/client";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { getPlayerByUserId } from "../../utils/player";
import { CreateApplicationBody } from "../../types/application";

export const applyToMatch = async (user: User, data: CreateApplicationBody) => {
  const { matchId, teamNumber, message, phone } = data;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teams: {
        include: {
          players: true
        }
      }
    }
  });
  if (!match) throw new CustomError("No existing match with id: " + matchId, ErrorCode.NO_MATCH);

  // TODO - ver si se puede postular a cualquiera de los dos equipos
  const team = match.teams.find((m) => m.teamNumber === teamNumber);
  if (team?.players && team?.players.length >= 2)
    throw new CustomError("Team is full", ErrorCode.APPLICATION_TEAM_FULL);

  const player = await getPlayerByUserId(user.id);

  return prisma.application.create({
    data: {
      matchId,
      playerId: player!.id,
      teamNumber: data.teamNumber,
      message: data.message,
      phone: data.phone
    }
  });
};
