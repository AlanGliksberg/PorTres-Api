import { ApplicationStatus, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { MatchDTO, MatchFilters, MATCH_STATUS } from "../../types/matchTypes";
import { createTeam, getDBFilter } from "../../utils/match";

export const createMatch = async (playerId: string, data: MatchDTO) => {
  const { date, time, location, category, pointsDeviation, teams, gender } = data;

  const matchStatus: MATCH_STATUS =
    (teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING;

  const match = await prisma.match.create({
    data: {
      dateTime: `${date}T${time}:00.000Z`,
      location,
      category,
      pointsDeviation,
      gender,
      creator: { connect: { id: playerId } },
      status: { connect: { name: matchStatus } },
      teams: {
        create: [await createTeam(1, teams?.team1, gender), await createTeam(2, teams?.team2, gender)]
      }
    }
  });

  return match;
};

export const getOpenMatches = async (filters: MatchFilters) => {
  const { page, pageSize } = filters;
  return await prisma.match.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
          status: {
            name: MATCH_STATUS.PENDING
          }
        },
        getDBFilter(filters)
      ]
    },
    include: {
      status: true,
      teams: {
        include: {
          players: true
        }
      }
    }
  });
};

export const getMyMatches = async (playerId: string, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  return await prisma.match.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
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
        },
        getDBFilter(filters)
      ]
    },
    include: {
      status: true,
      teams: {
        include: {
          players: true
        }
      }
    }
  });
};

export const getMatchById = async (matchId: string) => {
  return await prisma.match.findUnique({
    where: {
      id: matchId
    },
    include: {
      teams: {
        include: {
          players: true
        }
      },
      sets: true,
      status: true,
      application: {
        where: {
          status: ApplicationStatus.PENDING
        }
      }
    }
  });
};
