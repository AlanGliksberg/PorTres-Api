import { Match, Prisma } from "@prisma/client";
import { MatchDto, GetMatchesRequest, MATCH_STATUS, MatchFilters } from "../types/matchTypes";
import { PlayerDTO } from "../types/playerTypes";
import { TeamDTO } from "../types/team";
import {
  convertStringIntoNumberArray,
  getDateFromString,
  getLocalMinFromDate,
  getTimeFromString,
  parsePagesFilters
} from "./common";
import { createOrGetPlayers } from "./player";
import { ApplicationWithRelations } from "../types/application";
import prisma from "../prisma/client";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import { getUserSelect } from "./auth";

export const createTeam = async (teamNumber: 1 | 2, players: PlayerDTO[] | undefined, allowedGenderId: number) => {
  return {
    teamNumber,
    players: { connect: await createOrGetPlayers(players, allowedGenderId) }
  };
};

export const parseMatchFilters = (filters: GetMatchesRequest): MatchFilters => {
  const { page, pageSize, description, dateFrom, dateTo, timeFrom, timeTo, gender, category, status, duration } =
    filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  const matchGenders = convertStringIntoNumberArray(gender);
  const matchStatus = convertStringIntoNumberArray(status);
  const matchDateFrom = getDateFromString(dateFrom);
  const matchDateTo = getDateFromString(dateTo);
  const matchTimeFrom = getTimeFromString(timeFrom);
  const matchTimeTo = getTimeFromString(timeTo);
  const matchesCategories = convertStringIntoNumberArray(category);
  const matchDuration = convertStringIntoNumberArray(duration);

  return {
    description,
    dateFrom: matchDateFrom,
    dateTo: matchDateTo,
    timeFrom: matchTimeFrom,
    timeTo: matchTimeTo,
    genders: matchGenders,
    categories: matchesCategories,
    status: matchStatus,
    duration: matchDuration,
    page: pageNumber,
    pageSize: pageSizeNumber
  };
};

export const getDBFilter = (filters: MatchFilters) => {
  const where: Prisma.MatchWhereInput = {};
  const { description, dateFrom, dateTo, timeFrom, timeTo, genders, categories, status, duration } = filters;
  console.log("filters", filters);
  if (description)
    where.OR = [
      { location: { contains: description, mode: "insensitive" } },
      { description: { contains: description, mode: "insensitive" } }
    ];
  if (dateFrom && dateTo) {
    const dateFromOnly = new Date(dateFrom);
    dateFromOnly.setHours(0, 0, 0, 0);
    const dateToOnly = new Date(dateTo);
    dateToOnly.setHours(24, 0, 0, 0);
    where.dateTime = { gte: dateFromOnly, lte: dateToOnly };
  } else if (dateFrom) {
    const dateOnly = new Date(dateFrom);
    dateOnly.setHours(0, 0, 0, 0);
    where.dateTime = { gte: dateOnly };
  } else if (dateTo) {
    const dateOnly = new Date(dateTo);
    dateOnly.setHours(24, 0, 0, 0);
    where.dateTime = { lte: dateOnly };
  }
  if (timeFrom && timeTo) {
    where.localMin = {
      gte: getLocalMinFromDate(timeFrom),
      lte: getLocalMinFromDate(timeTo)
    };
  } else if (timeFrom) {
    console.log("timeFrom", timeFrom);
    console.log("timeFrom validar", getLocalMinFromDate(timeFrom));
    where.localMin = {
      gte: getLocalMinFromDate(timeFrom)
    };
  } else if (timeTo) {
    where.localMin = {
      lte: getLocalMinFromDate(timeTo)
    };
  }
  if (genders && genders.length > 0) where.gender = { id: { in: genders } };
  if (categories && categories.length > 0) where.category = { id: { in: categories } };
  if (status && status.length > 0) where.status = { id: { in: status } };
  if (duration && duration.length > 0) where.duration = { in: duration };
  return where;
};

export const parseMatches = (matches: Match[]) => {
  return matches.map((m) => {
    const date = m.dateTime.toISOString();
    return {
      ...m,
      date: date.split("T")[0],
      time: date.split("T")[1].substring(0, 5)
    };
  });
};

export const addPlayerToMatchFromApplication = async (
  application: NonNullable<ApplicationWithRelations>,
  teamNumber: 1 | 2
) => {
  // Verifico que el jugador no esté ya en el partido
  if (application.match) {
    const playerInMatch = application.match.teams.some((team) =>
      team.players.some((player) => player.id === application.playerId)
    );

    if (playerInMatch) {
      throw new CustomError("El jugador ya está en el partido", ErrorCode.PLAYER_ALREADY_IN_MATCH);
    }
  }

  return await prisma.match.update({
    where: { id: application.matchId },
    data: {
      teams: {
        update: {
          where: {
            matchId_teamNumber: {
              matchId: application.matchId,
              teamNumber: teamNumber
            }
          },
          data: {
            players: {
              connect: {
                id: application.playerId
              }
            }
          }
        }
      },
      players: {
        connect: {
          id: application.playerId
        }
      }
    },
    include: {
      players: true
    }
  });
};

export const validateCreateMatchBody = (body: MatchDto) => {
  // TODO - completar
  if (!body.date || !body.time || !body.location || !body.duration)
    throw new CustomError("Body incorrecto", ErrorCode.CREATE_MATCH_INCORRECT_BODY);
};

export const updateTeams = async (matchId: number, teams: TeamDTO, allowedGenderId: number) => {
  // Primero desconectamos todos los jugadores actuales del partido y de los equipos
  await prisma.match.update({
    where: { id: matchId },
    data: {
      players: {
        set: []
      },
      teams: {
        update: [
          {
            where: {
              matchId_teamNumber: {
                matchId,
                teamNumber: 1
              }
            },
            data: {
              players: {
                set: []
              }
            }
          },
          {
            where: {
              matchId_teamNumber: {
                matchId,
                teamNumber: 2
              }
            },
            data: {
              players: {
                set: []
              }
            }
          }
        ]
      }
    }
  });

  // Luego conectamos los nuevos jugadores
  const team1 = await createTeam(1, teams.team1, allowedGenderId);
  const team2 = await createTeam(2, teams.team2, allowedGenderId);

  return await prisma.match.update({
    where: { id: matchId },
    data: {
      players: {
        connect: [...team1.players.connect, ...team2.players.connect]
      },
      teams: {
        update: [
          {
            where: {
              matchId_teamNumber: {
                matchId,
                teamNumber: 1
              }
            },
            data: {
              players: {
                connect: team1.players.connect
              }
            }
          },
          {
            where: {
              matchId_teamNumber: {
                matchId,
                teamNumber: 2
              }
            },
            data: {
              players: {
                connect: team2.players.connect
              }
            }
          }
        ]
      }
    }
  });
};

export const getCommonMatchInlcude = () => {
  return {
    status: true,
    gender: true,
    category: true,
    players: true,
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
};

export const executeGetMatch = async (
  page: number,
  pageSize: number,
  where: Prisma.MatchWhereInput,
  include: Prisma.MatchInclude,
  orderBy: Prisma.MatchOrderByWithRelationInput
) => {
  return await prisma.$transaction([
    prisma.match.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      include,
      orderBy
    }),
    prisma.match.count({
      where
    })
  ]);
};
