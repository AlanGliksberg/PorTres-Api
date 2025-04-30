import { MatchStatus, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { MatchDTO } from "../../types/matchTypes";
import { MATCH_STATUS } from "../../constants/matchStatus";
import { createTeam } from "../../utils/match";
import { getPlayerByUserId } from "../../utils/player";
import { GENDER } from "../../constants/gender";

export const createMatch = async (user: User, data: MatchDTO) => {
  const { date, time, location, category, pointsDeviation, teams, gender } = data;

  const matchStatus: MATCH_STATUS =
    (teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING;

  const player = await getPlayerByUserId(user.id);

  const match = await prisma.match.create({
    data: {
      date: new Date(date),
      time,
      location,
      category,
      pointsDeviation,
      gender,
      creator: { connect: { id: player!.id } },
      status: { connect: { name: matchStatus } },
      teams: {
        create: [await createTeam(1, teams?.team1, gender), await createTeam(2, teams?.team2, gender)]
      }
    }
  });

  return match;
};

export const getOpenMatches = async (matchGender: GENDER, page: number, pageSize: number) => {
  return await prisma.match.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
          status: {
            name: MATCH_STATUS.PENDING
          },
          OR: [{ gender: GENDER.X }, { gender: matchGender }]
        }
      ]
    }
  });
};

export const getMyMatches = async (playerId: string, page: number, pageSize: number) => {
  return await prisma.match.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      OR: [
        { creatorPlayerId: playerId },
        {
          players: {
            some: {
              id: playerId
            }
          }
        }
      ]
    }
  });
};
