import { ApplicationStatus, Prisma, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { MatchDto, MatchFilters, MATCH_STATUS, AddPlayerToMatchRequest } from "../../types/matchTypes";
import { createTeam, getDBFilter } from "../../utils/match";
import { getUserSelect } from "../../utils/auth";

export const createMatch = async (playerId: number, data: MatchDto) => {
  const { date, time, location, description, categoryId, pointsDeviation, teams, genderId, duration } = data;

  const matchStatus: MATCH_STATUS =
    (teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.CLOSED : MATCH_STATUS.PENDING;

  const team1 = await createTeam(1, teams?.team1, genderId);
  const team2 = await createTeam(2, teams?.team2, genderId);

  const match = await prisma.match.create({
    data: {
      dateTime: `${date}T${time}:00.000Z`,
      location,
      description,
      pointsDeviation,
      category: {
        connect: {
          id: categoryId
        }
      },
      gender: {
        connect: {
          id: genderId
        }
      },
      creator: { connect: { id: playerId } },
      status: { connect: { name: matchStatus } },
      players: { connect: [...team1.players.connect, ...team2.players.connect] },
      teams: {
        create: [team1, team2]
      },
      duration
    }
  });
  // TODO - notificar jugadores (en el caso que haya)

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

export const getMyMatches = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize, createdBy, isPlayer } = filters;

  const or = [];
  const include: Prisma.MatchInclude = {
    status: true,
    gender: true,
    category: true,
    teams: {
      include: {
        players: {
          include: {
            gender: true,
            category: true,
            position: true,
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
      getDBFilter(filters),
      {
        status: {
          name: MATCH_STATUS.PENDING
        }
      }
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

export const getMatchById = async (matchId: number) => {
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

export const deleteMatch = async (matchId: number) => {
  return await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          name: MATCH_STATUS.CANCELLED
        }
      }
    }
  });
};

export const addPlayerToMatch = async (data: AddPlayerToMatchRequest) => {
  // TODO - validar que el equipo tenga un lugar dispobile
  // no se puede incluir un jugador que ya esta en el partido
  return await prisma.match.update({
    where: {
      id: data.matchId
    },
    data: {
      players: {
        connect: { id: data.playerId }
      },
      teams: {
        update: {
          where: {
            matchId_teamNumber: {
              matchId: data.matchId,
              teamNumber: data.teamNumber
            }
          },
          data: {
            players: {
              connect: { id: data.playerId }
            }
          }
        }
      }
    },
    include: { players: true }
  });
};

export const changeState = async (matchId: number, status: MATCH_STATUS) => {
  return await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          name: status
        }
      }
    }
  });
};
