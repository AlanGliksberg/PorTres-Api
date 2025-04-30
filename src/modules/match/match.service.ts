import { MatchStatus, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { MatchDTO } from "../../types/matchTypes";
import { MATCH_STATUS } from "../../constants/matchStatus";
import { createTeam } from "../../utils/match";
import { getPlayerByUserId } from "../../utils/player";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { GENDER } from "../../constants/gender";

export const createMatch = async (user: User, data: MatchDTO) => {
  const { date, time, location, category, pointsDeviation, teams, gender } = data;

  // TODO - ver si se puede refactorizar asociando un codigo al status
  const matchStatus: MatchStatus | null = await prisma.matchStatus.findUnique({
    where: {
      name: (teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING
    }
  });

  if (!matchStatus) throw new CustomError("No match status", ErrorCode.MATCH_STATUS);

  const player = await getPlayerByUserId(user.id);

  const match = await prisma.match.create({
    data: {
      date: new Date(date),
      time,
      location,
      category,
      pointsDeviation,
      statusId: matchStatus.id,
      creatorPlayerId: player!.id,
      gender,
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
