import { ApplicationStatus, Prisma, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { MatchDTO, MatchFilters, MATCH_STATUS } from "../../types/matchTypes";
import { createTeam, getDBFilter } from "../../utils/match";
import { getUserSelect } from "../../utils/auth";

export const createMatch = async (playerId: string, data: MatchDTO) => {
  const { date, time, location, description, category, pointsDeviation, teams, genderId, duration } = data;

  const matchStatus: MATCH_STATUS =
    (teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING;

  const match = await prisma.match.create({
    data: {
      dateTime: `${date}T${time}:00.000Z`,
      location,
      description,
      category,
      pointsDeviation,
      gender: {
        connect: {
          id: genderId
        }
      },
      creator: { connect: { id: playerId } },
      status: { connect: { name: matchStatus } },
      teams: {
        create: [await createTeam(1, teams?.team1, genderId), await createTeam(2, teams?.team2, genderId)]
      },
      duration
    }
  });

  return match;
};

export const getOpenMatches = async (filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const where = {
    AND: [
      {
        status: {
          name: MATCH_STATUS.PENDING
        }
      },
      getDBFilter(filters)
    ]
  };

  return await prisma.$transaction([
    prisma.match.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      include: {
        status: true,
        teams: {
          include: {
            players: true
          }
        }
      }
    }),
    prisma.match.count({
      where
    })
  ]);
};

export const getMyMatches = async (playerId: string, filters: MatchFilters) => {
  const { page, pageSize, createdBy, isPlayer } = filters;

  const or = [];
  const include: Prisma.MatchInclude = {
    status: true,
    gender: true,
    teams: {
      include: {
        players: {
          include: {
            gender: true,
            user: getUserSelect()
          }
        }
      }
    }
  };
  if (createdBy) {
    or.push({ creatorPlayerId: playerId });
    include.applications = {
      where: {
        status: ApplicationStatus.PENDING
      }
    };
  }
  if (isPlayer)
    or.push({
      players: {
        some: {
          id: playerId
        }
      }
    });

  const where = {
    AND: [
      {
        OR: or
      },
      getDBFilter(filters)
    ]
  };

  return await prisma.$transaction([
    prisma.match.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      include,
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.match.count({
      where
    })
  ]);
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
      applications: {
        where: {
          status: ApplicationStatus.PENDING
        }
      }
    }
  });
};
