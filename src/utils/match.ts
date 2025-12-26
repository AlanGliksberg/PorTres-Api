import { Category, Match, MatchClub, Player, Prisma, Set } from "@prisma/client";
import { MatchDto, GetMatchesRequest, MatchFilters, MatchWithFullDetails, MATCH_STATUS } from "../types/matchTypes";
import { CATEGORY, PlayerDTO } from "../types/playerTypes";
import { TeamDTO, TeamWithPlayers } from "../types/team";
import {
  convertStringIntoNumberArray,
  getDateFromString,
  getLocalMinFromDate,
  getTimeFromString,
  parsePagesFilters
} from "./common";
import { createOrGetPlayers, getCategoryById, getOneCategoryDown, getOneCategoryUp } from "./player";
import { ApplicationWithRelations } from "../types/application";
import prisma from "../prisma/client";
import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import { getUserSelect } from "./auth";
import { getMatchById } from "../modules/match/match.service";
import {
  publishMatchConfirmed,
  publishPlayerAddedToMatch,
  publishPlayerAscended,
  publishPlayerDescended,
  publishPlayerRemovedFromMatch
} from "../workers/publisher";

export const createTeam = async (teamNumber: 1 | 2, players: PlayerDTO[] | undefined, allowedGenderId: number) => {
  return {
    teamNumber,
    players: { connect: await createOrGetPlayers(players, allowedGenderId) }
  };
};

export const parseMatchFilters = (filters: GetMatchesRequest): MatchFilters => {
  const {
    page,
    pageSize,
    matchId,
    description,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    gender,
    category,
    status,
    duration
  } = filters;
  const [pageNumber, pageSizeNumber] = parsePagesFilters(page, pageSize);
  const matchGenders = convertStringIntoNumberArray(gender);
  const matchStatus = convertStringIntoNumberArray(status);
  const matchDateFrom = getDateFromString(dateFrom);
  const matchDateTo = getDateFromString(dateTo);
  const matchTimeFrom = getTimeFromString(timeFrom);
  const matchTimeTo = getTimeFromString(timeTo);
  const matchesCategories = convertStringIntoNumberArray(category);
  const matchDuration = convertStringIntoNumberArray(duration);
  const matchIdNumber =
    matchId !== undefined && matchId !== "" && !Number.isNaN(Number(matchId)) ? Number(matchId) : undefined;

  return {
    matchId: matchIdNumber,
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
  const { matchId, description, dateFrom, dateTo, timeFrom, timeTo, genders, categories, status, duration } = filters;

  if (description)
    where.OR = [
      { location: { contains: description, mode: "insensitive" } },
      { description: { contains: description, mode: "insensitive" } }
    ];
  if (matchId !== undefined) where.id = matchId;
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
  if (!body.date || !body.time || !body.duration || (!body.location && !body.clubId))
    throw new CustomError("Body incorrecto", ErrorCode.CREATE_MATCH_INCORRECT_BODY);
};

export const getMatchClubById = async (matchClubId: number): Promise<MatchClub> => {
  const matchClub = await prisma.matchClub.findUnique({ where: { id: matchClubId } });
  if (!matchClub) {
    throw new CustomError("Club no encontrado", ErrorCode.CREATE_MATCH_INCORRECT_BODY);
  }

  return matchClub;
};

type UpdateTeamsOptions = {
  updateStatus?: boolean;
  sendNotifications?: boolean;
};

export const updateTeams = async (
  matchId: number,
  teams: TeamDTO,
  allowedGenderId: number,
  matchCreatorPlayerId: number,
  options?: UpdateTeamsOptions
) => {
  const match = await getMatchById(matchId);
  const actualPlayers = match!.players;
  const shouldUpdateStatus = options?.updateStatus !== false;
  const shouldSendNotifications = options?.sendNotifications !== false;

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

  const newPlayers = [...team1.players.connect, ...team2.players.connect];
  const status = shouldUpdateStatus
    ? await getMatchStatusByCode(newPlayers.length === 4 ? MATCH_STATUS.COMPLETED : MATCH_STATUS.PENDING)
    : match?.status;

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      ...(shouldUpdateStatus && {
        status: {
          connect: { id: status!.id }
        }
      }),
      players: {
        connect: newPlayers
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

  // Notificaciones
  if (shouldSendNotifications) {
    const removedPlayers = actualPlayers.filter((actualPlayer) => {
      return !newPlayers.some((newPlayer) => newPlayer.id === actualPlayer.id);
    });

    const addedPlayers = newPlayers.filter((newPlayer) => {
      return !actualPlayers.some((actualPlayer) => newPlayer.id === actualPlayer.id);
    });

    removedPlayers.forEach(async (player) => {
      if (player.userId && player.id !== matchCreatorPlayerId) {
        await publishPlayerRemovedFromMatch(
          matchId,
          player.id,
          matchCreatorPlayerId,
          matchCreatorPlayerId,
          [],
          status?.code as MATCH_STATUS
        );
      }
    });

    addedPlayers.forEach(async (player) => {
      if (player.id !== matchCreatorPlayerId) {
        await publishPlayerAddedToMatch(
          matchId,
          player.id,
          matchCreatorPlayerId,
          team1.players.connect.some((p) => p.id === player.id) ? 1 : 2
        );
      }
    });

    if (status!.code === MATCH_STATUS.COMPLETED) {
      await publishMatchConfirmed(
        matchId,
        newPlayers.filter((p) => p.id).map((p) => p.id),
        match?.dateTime!,
        match!.creatorPlayerId
      );
    }
  }

  return updatedMatch;
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

export const updateRankings = async (match: MatchWithFullDetails, winnerTeam: number) => {
  const matchId = match.id;

  const teams = match.teams;
  const team1 = teams.find((t) => t.teamNumber === 1)!;
  const team2 = teams.find((t) => t.teamNumber === 2)!;

  const weightedElo1 = getWeightedElo(team1);
  const weightedElo2 = getWeightedElo(team2);

  if (winnerTeam === 1) {
    const expectedResult = getExpectedResult(weightedElo1, weightedElo2);
    const baseChange = getBaseChange(expectedResult);
    team1.players.forEach(async (player) => {
      await updatePlayersElo(matchId, player, baseChange, true);
    });
    team2.players.forEach(async (player) => {
      await updatePlayersElo(matchId, player, -baseChange, false);
    });
  } else {
    const expectedResult = getExpectedResult(weightedElo2, weightedElo1);
    const baseChange = getBaseChange(expectedResult);
    team1.players.forEach(async (player) => {
      await updatePlayersElo(matchId, player, -baseChange, true);
    });
    team2.players.forEach(async (player) => {
      await updatePlayersElo(matchId, player, baseChange, false);
    });
  }
};

const getWeightedElo = (team: TeamWithPlayers) => {
  // Calcula el ELO ponderado de un equipo usando rankingPoints y confidence de cada jugador
  // Fórmula: (sum(rankingPoints * confidence)) / (sum(confidence))
  const rankingPoints = team.players.map((p) => p.rankingPoints ?? 0);
  const confidences = team.players.map((p) => p.confidence ?? 0.1);

  const numerador = rankingPoints.reduce((acc, rp, idx) => acc + rp * confidences[idx], 0);
  const denominador = confidences.reduce((acc, c) => acc + c, 0);

  if (denominador === 0) return 0;

  return numerador / denominador;
};

const getExpectedResult = (myElo: number, otherElo: number) => {
  // Calcula el resultado esperado usando la fórmula de ELO:
  // Resultado esperado = 1 / (1 + 10^((otherElo - myElo) / 400))
  const diferencia = otherElo - myElo;
  const resultadoEsperado = 1 / (1 + Math.pow(10, diferencia / 400));
  return resultadoEsperado;
};

const getBaseChange = (expectedResult: number) => {
  return 10 * (1 - expectedResult);
};

export const saveWinnerTeam = async (matchId: number, winnerTeam: number) => {
  await prisma.match.update({
    where: { id: matchId },
    data: { winnerTeamNumber: winnerTeam }
  });
};

export const updatePlayersElo = async (matchId: number, player: Player, baseChange: number, isWinner: boolean) => {
  if (!player.userId) return;
  const adjustmentFactor = 2 - player.confidence;
  const deltaPoints = Math.round(baseChange * adjustmentFactor);
  let newElo = player.rankingPoints + deltaPoints;
  if (newElo < 0) newElo = 0;

  await prisma.player.update({
    where: { id: player.id },
    data: { rankingPoints: newElo }
  });

  await prisma.playerRankingChange.create({
    data: {
      matchId,
      playerId: player.id,
      oldPoints: player.rankingPoints,
      deltaPoints,
      newPoints: newElo,
      isWinner
    }
  });

  await checkAscenseOrDescense(player, newElo);
};

const checkAscenseOrDescense = async (player: Player, newElo: number) => {
  const category = await getCategoryById(player.categoryId!);
  if (newElo > category.maxPoints) await ascendPlayer(player, category);
  // Le dejo 15 puntos (15%) de tolerancia para el descenso
  else if (newElo < category.minPoints - 15) await descendPlayer(player, category);
};

const ascendPlayer = async (player: Player, category: Category) => {
  const newCategory = await getOneCategoryUp(category);
  await changePlayerCategory(player.id, newCategory.id);

  // Notificar ascenso
  await publishPlayerAscended(player.id, category.code as CATEGORY);
};

const descendPlayer = async (player: Player, category: Category) => {
  const newCategory = await getOneCategoryDown(category);
  await changePlayerCategory(player.id, newCategory.id);

  // Notificar descenso
  await publishPlayerDescended(player.id, category.code as CATEGORY);
};

const changePlayerCategory = async (playerId: number, categoryId: number) => {
  await prisma.player.update({
    where: { id: playerId },
    data: { categoryId }
  });
};

export const getWinnerTeamNumber = (sets: Omit<Set, "id">[]) => {
  if (!sets || sets.length === 0) {
    return 0;
  }

  let setsGanadosEquipo1 = 0;
  let setsGanadosEquipo2 = 0;

  for (const set of sets) {
    if (set.team1Score > set.team2Score) {
      setsGanadosEquipo1++;
    } else if (set.team2Score > set.team1Score) {
      setsGanadosEquipo2++;
    }
  }

  return setsGanadosEquipo1 > setsGanadosEquipo2 ? 1 : setsGanadosEquipo2 > setsGanadosEquipo1 ? 2 : 0;
};

export const addConfidenceToPlayer = async (player: Player) => {
  if (!player.userId) return;
  const newConfidence = Math.min((player.confidence ?? 0) + 0.1, 1);
  await prisma.player.update({
    where: { id: player.id },
    data: { confidence: newConfidence }
  });
};

export const getMatchStatusByCode = async (code: MATCH_STATUS) => {
  return await prisma.matchStatus.findUnique({
    where: {
      code
    }
  });
};

export const getMatchStatusById = async (id: number) => {
  return await prisma.matchStatus.findUnique({
    where: {
      id
    }
  });
};
