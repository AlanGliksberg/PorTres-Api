import { Match, Prisma } from "@prisma/client";
import { MatchDto, GetMatchesRequest, MATCH_STATUS, MatchFilters } from "../types/matchTypes";
import { GENDER, PlayerDTO } from "../types/playerTypes";
import { TeamDTO } from "../types/team";
import { convertStringIntoArray, parsePagesFilters } from "./common";
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
  const { page, pageSize, gender, status } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  let matchGenders = convertStringIntoArray<GENDER>(gender);
  let matchStatus = convertStringIntoArray<MATCH_STATUS>(status);

  return {
    genders: matchGenders,
    status: matchStatus,
    page: pageNumber,
    pageSize: pageSizeNumber
  };
};

export const getDBFilter = (filters: MatchFilters) => {
  const where: Prisma.MatchWhereInput = {};
  const { genders, status } = filters;
  if (genders && genders.length > 0) where.gender = { code: { in: genders } };
  if (status && status.length > 0) where.status = { name: { in: status } };
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
      }
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
