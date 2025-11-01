import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import {
  MatchDto,
  MatchFilters,
  MATCH_STATUS,
  AddPlayerToMatchRequest,
  UpdateMatchDto,
  DeletePlayerFromMatchRequest,
  UpdateMatchResultDto,
  MatchWithFullDetails,
  CreateMatchWithResultDto
} from "../../types/matchTypes";
import {
  addConfidenceToPlayer,
  createTeam,
  executeGetMatch,
  getCommonMatchInlcude,
  getDBFilter,
  getWinnerTeamNumber,
  saveWinnerTeam,
  updateRankings,
  updateTeams
} from "../../utils/match";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { createOrGetPlayer, getPlayerById, verifyGenderById } from "../../utils/player";
import { APPLICATION_STATUS } from "../../types/application";
import { GENDER, PlayerDTO } from "../../types/playerTypes";
import { getUserSelect } from "../../utils/auth";
import {
  publishMatchCancelled,
  publishMatchConfirmed,
  publishPlayerAddedToMatch,
  publishPlayerRemovedFromMatch,
  publishResultAccepted,
  publishResultCreated,
  publishResultRejected
} from "../../workers/publisher";

export const createMatch = async (playerId: number, data: MatchDto, withNotification = true, status?: MATCH_STATUS) => {
  const { date, time, location, description, categoryId, pointsDeviation, teams, genderId, duration } = data;

  // Validar que cada jugador aparezca solo una vez en los equipos
  if (teams) {
    const allPlayers = [...(teams.team1 || []), ...(teams.team2 || [])];
    const playerIds = allPlayers.map((player) => player.id).filter(Boolean);
    const uniquePlayerIds = [...new Set(playerIds)];

    if (playerIds.length !== uniquePlayerIds.length) {
      throw new CustomError("No se puede agregar el mismo jugador 2 veces", ErrorCode.PLAYER_ALREADY_IN_MATCH);
    }
  }

  const matchStatus: MATCH_STATUS =
    status ||
    ((teams?.team1?.length || 0) + (teams?.team2?.length || 0) === 4 ? MATCH_STATUS.COMPLETED : MATCH_STATUS.PENDING);

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
      status: { connect: { code: matchStatus } },
      players: { connect: [...team1.players.connect, ...team2.players.connect] },
      teams: {
        create: [team1, team2]
      },
      duration
    },
    include: {
      teams: {
        include: {
          players: true
        }
      },
      players: true
    }
  });

  // Notificaciones a jugadores
  if (withNotification) {
    if (teams) {
      const team1Ids = (teams.team1 || []).filter((p) => p.id).map((p) => p.id!);
      const team2Ids = (teams.team2 || []).filter((p) => p.id).map((p) => p.id!);
      team1Ids.forEach(async (pId) => {
        if (pId && pId !== playerId) await publishPlayerAddedToMatch(match.id, pId, playerId, 1);
      });
      team2Ids.forEach(async (pId) => {
        if (pId && pId !== playerId) await publishPlayerAddedToMatch(match.id, pId, playerId, 2);
      });
      if (matchStatus === MATCH_STATUS.COMPLETED) {
        await publishMatchConfirmed(
          match.id,
          [...team1Ids.filter((p) => p), ...team2Ids.filter((p) => p)],
          match.dateTime,
          match.creatorPlayerId
        );
      }
    }
  }

  return match;
};

export const getOpenMatches = async (filters: MatchFilters, playerId: number | undefined) => {
  const { page, pageSize } = filters;
  const now = new Date();
  const currentTimeWithoutOffset = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  const where = {
    AND: [
      {
        status: {
          code: MATCH_STATUS.PENDING
        }
      },
      getDBFilter(filters),
      {
        dateTime: {
          gte: currentTimeWithoutOffset
        }
      }
    ]
  };

  const include = {
    status: true,
    category: true,
    gender: true,
    players: true,
    teams: {
      include: {
        players: {
          include: {
            user: getUserSelect()
          }
        }
      }
    },
    applications: {
      where: {
        playerId
      },
      include: {
        status: true
      }
    }
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "asc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getCreatedMatches = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const include: Prisma.MatchInclude = getCommonMatchInlcude();

  include.applications = {
    where: {
      status: {
        code: APPLICATION_STATUS.PENDING
      }
    },
    include: {
      player: {
        include: {
          gender: true,
          category: true,
          position: true,
          user: getUserSelect()
        }
      }
    }
  };

  const where: Prisma.MatchWhereInput = {
    AND: [
      { creatorPlayerId: playerId },
      getDBFilter(filters),
      {
        status: {
          code: {
            not: MATCH_STATUS.CLOSED
          }
        }
      },
      {
        dateTime: {
          gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
        }
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "asc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getPlayedMatches = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const include: Prisma.MatchInclude = getCommonMatchInlcude();
  include.playerRankingChange = true;
  include.sets = true;

  const where: Prisma.MatchWhereInput = {
    AND: [
      {
        players: {
          some: {
            id: playerId
          }
        }
      },
      getDBFilter(filters),
      {
        status: {
          code: MATCH_STATUS.CLOSED
        }
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "desc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getAppliedMatches = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const include: Prisma.MatchInclude = getCommonMatchInlcude();

  include.applications = {
    where: {
      playerId
    },
    include: {
      player: {
        include: {
          gender: true,
          category: true,
          position: true
        }
      },
      status: true
    }
  };

  const where: Prisma.MatchWhereInput = {
    AND: [
      {
        applications: {
          some: {
            playerId
          }
        }
      },
      {
        status: {
          code: MATCH_STATUS.PENDING
        }
      },
      {
        dateTime: {
          gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
        }
      },
      getDBFilter(filters)
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "asc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getMyMatches = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const include: Prisma.MatchInclude = getCommonMatchInlcude();

  const where: Prisma.MatchWhereInput = {
    AND: [
      {
        players: {
          some: {
            id: playerId
          }
        }
      },
      {
        status: {
          code: {
            in: [MATCH_STATUS.PENDING, MATCH_STATUS.COMPLETED]
          }
        }
      },
      {
        dateTime: {
          gte: new Date(new Date().setUTCHours(0, 0, 0, 0))
        }
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "asc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getMyPendingResults = async (playerId: number, filters: MatchFilters) => {
  const { page, pageSize } = filters;
  const include: Prisma.MatchInclude = getCommonMatchInlcude();
  include.sets = {
    orderBy: {
      setNumber: "asc"
    }
  };

  const where: Prisma.MatchWhereInput = {
    AND: [
      {
        players: {
          some: {
            id: playerId
          }
        }
      },
      // Al menos un jugador de cada equipo tenga la aplicación
      // {
      //   teams: {
      //     every: {
      //       players: {
      //         some: {
      //           userId: {
      //             not: null
      //           }
      //         }
      //       }
      //     }
      //   }
      // },
      {
        status: {
          code: MATCH_STATUS.CLOSED
        }
      },
      {
        winnerTeamNumber: null
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    dateTime: "asc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
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
      players: true,
      sets: true,
      status: true,
      gender: true,
      applications: {
        where: {
          status: {
            code: APPLICATION_STATUS.PENDING
          }
        }
      }
    }
  });
};

export const deleteMatch = async (matchId: number, playerId: number) => {
  const match = await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          code: MATCH_STATUS.CANCELLED
        }
      }
    },
    include: {
      players: true
    }
  });

  match.players.forEach(async (player) => {
    if (player.id !== playerId) await publishMatchCancelled(matchId, player.id);
  });

  return match;
};

export const addPlayerToMatch = async (data: AddPlayerToMatchRequest, addedByPlayerId: number) => {
  // Obtener el partido actual para validaciones
  const currentMatch = await getMatchById(data.matchId);
  if (!currentMatch) {
    throw new CustomError("No existing match with id: " + data.matchId, ErrorCode.NO_MATCH);
  }

  // Verificar que el jugador no esté ya en el partido
  const playerInMatch = currentMatch.teams.some((team) => team.players.some((player) => player.id === data.playerId));

  if (playerInMatch) {
    throw new CustomError("El jugador ya está en el partido", ErrorCode.PLAYER_ALREADY_IN_MATCH);
  }

  // Verificar que el equipo no esté lleno
  const targetTeam = currentMatch.teams.find((team) => team.teamNumber === data.teamNumber);
  if (targetTeam && targetTeam.players.length >= 2) {
    throw new CustomError("El equipo está lleno", ErrorCode.APPLICATION_TEAM_FULL);
  }

  const player: PlayerDTO = {
    id: data.playerId,
    firstName: data.firstName,
    lastName: data.lastName,
    genderId: data.genderId,
    categoryId: data.categoryId,
    phone: data.phone,
    positionId: data.positionId
  };

  const playerConnect = await createOrGetPlayer(player, currentMatch.genderId);
  const playerId = playerConnect.id;

  // TODO - validar genero de jugador contra el genero de partido
  const updatedMatch = await prisma.match.update({
    where: {
      id: data.matchId
    },
    data: {
      players: {
        connect: playerConnect
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
              connect: playerConnect
            }
          }
        }
      }
    },
    include: {
      players: true
    }
  });

  if (player.id && playerId !== addedByPlayerId)
    await publishPlayerAddedToMatch(data.matchId, playerId, addedByPlayerId, data.teamNumber);

  return updatedMatch;
};

export const changeState = async (matchId: number, status: MATCH_STATUS) => {
  const match = await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          code: status
        }
      }
    },
    include: {
      players: true
    }
  });

  // TODO - si se cambia a COMPLETED, notificar a jugadores, guardar evento de cambio a CLOSED, guardar recordatorio de carga de resultado
  if (status === MATCH_STATUS.COMPLETED) {
    await publishMatchConfirmed(
      matchId,
      match.players.filter((p) => p.id).map((p) => p.id),
      match.dateTime,
      match.creatorPlayerId
    );
  }

  return match;
};

export const updateMatch = async (matchId: number, data: UpdateMatchDto, playerId: number) => {
  const updateData: any = {};

  if (data.location !== undefined) updateData.location = data.location;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.duration !== undefined) updateData.duration = data.duration;
  if (data.pointsDeviation !== undefined) updateData.pointsDeviation = data.pointsDeviation;

  if (data.date && data.time) {
    updateData.dateTime = `${data.date}T${data.time}:00.000Z`;
  }

  if (data.genderId !== undefined) {
    updateData.gender = { connect: { id: data.genderId } };
  }

  if (data.categoryId !== undefined) {
    updateData.category = { connect: { id: data.categoryId } };
  }

  // Si se van a actualizar los equipos, necesitamos el genderId para validaciones
  let genderId = data.genderId;
  if (data.teams && !genderId) {
    const currentMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { gender: true }
    });
    genderId = currentMatch?.genderId;
  }

  if (data.teams) {
    if (data.teams.team1) {
      for (const player of data.teams.team1) {
        await verifyGenderById(genderId!, player.genderId);
      }
    }
    if (data.teams.team2) {
      for (const player of data.teams.team2) {
        await verifyGenderById(genderId!, player.genderId);
      }
    }
  }

  // TODO - si hay 4 jugadores, el partido esta confirmed
  // Actualizar el partido
  const updatedMatch = await prisma.match.update({
    where: {
      id: matchId
    },
    data: updateData,
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
          status: {
            code: APPLICATION_STATUS.PENDING
          }
        }
      }
    }
  });

  // Si se incluyen equipos, actualizarlos
  if (data.teams && genderId) {
    // Validar que cada jugador aparezca solo una vez en los equipos
    const allPlayers = [...(data.teams.team1 || []), ...(data.teams.team2 || [])];
    const playerIds = allPlayers.map((player) => player.id).filter(Boolean);
    const uniquePlayerIds = [...new Set(playerIds)];

    if (playerIds.length !== uniquePlayerIds.length) {
      throw new CustomError("No se puede agregar el mismo jugador 2 veces", ErrorCode.PLAYER_ALREADY_IN_MATCH);
    }

    await updateTeams(matchId, data.teams, genderId, playerId);

    // Obtener el partido actualizado con los nuevos equipos
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
            status: {
              code: APPLICATION_STATUS.PENDING
            }
          }
        }
      }
    });
  }

  return updatedMatch;
};

export const deletePlayerFromMatch = async (data: DeletePlayerFromMatchRequest, playerId: number) => {
  // Obtener el partido actual para validaciones
  const currentMatch = await getMatchById(data.matchId);
  if (!currentMatch) {
    throw new CustomError("No existing match with id: " + data.matchId, ErrorCode.NO_MATCH);
  }

  // Verificar que el jugador esté en el partido
  const playerInMatch = currentMatch.teams.some((team) => team.players.some((player) => player.id === data.playerId));
  if (!playerInMatch) {
    throw new CustomError("Player is not in the match", ErrorCode.UNAUTHORIZED);
  }

  // Encontrar en qué equipo está el jugador
  const teamWithPlayer = currentMatch.teams.find((team) => team.players.some((player) => player.id === data.playerId));
  if (!teamWithPlayer) {
    throw new CustomError("Player not found in any team", ErrorCode.UNAUTHORIZED);
  }

  // Obtener información del jugador para verificar si tiene userId
  const playerToDelete = await getPlayerById(data.playerId);
  if (!playerToDelete) {
    throw new CustomError("Player not found", ErrorCode.NO_PLAYER);
  }

  // Eliminar el jugador del partido y del equipo
  // TODO - revisar que al eliminar un jugador se pueda volver a agregar al mismo jugador
  const updatedMatch = await prisma.match.update({
    where: { id: data.matchId },
    data: {
      players: {
        disconnect: { id: data.playerId }
      },
      teams: {
        update: {
          where: {
            matchId_teamNumber: {
              matchId: data.matchId,
              teamNumber: teamWithPlayer.teamNumber
            }
          },
          data: {
            players: {
              disconnect: { id: data.playerId }
            }
          }
        }
      }
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
          status: {
            code: APPLICATION_STATUS.PENDING
          }
        }
      }
    }
  });

  // Si el jugador no tiene userId, eliminarlo completamente de la base de datos
  if (!playerToDelete.userId) {
    await prisma.player.delete({
      where: { id: data.playerId }
    });
  } else if (playerToDelete.id !== playerId) {
    //notificar que fue eliminado (solo si no es quien está eliminando)
    await publishPlayerRemovedFromMatch(data.matchId, playerToDelete.id);
  }

  if (currentMatch.status.code !== MATCH_STATUS.PENDING) {
    await changeState(data.matchId, MATCH_STATUS.PENDING);
  }

  return updatedMatch;
};

export const getPlayedMatchesCount = async (playerId: number) => {
  const matches = await getPlayedMatches(playerId, { page: 1, pageSize: 1 });

  return matches[1];
};

export const updateMatchResult = async (
  match: MatchWithFullDetails,
  body: UpdateMatchResultDto,
  resultLoadedByTeam: number
) => {
  // TODO - si en el otro equipo no hay un jugador que tenga la app, ya hay que marcar al equipo ganador
  const sets = body.sets.map((set, index) => ({
    matchId: match.id,
    setNumber: index + 1,
    team1Score: set[0],
    team2Score: set[1]
  }));
  let winnerTeamNumber = null;
  const otherTeam = match.teams.find((team) => team.teamNumber !== resultLoadedByTeam);
  const otherTeamHasPlayerWithApp = otherTeam?.players.some((player) => player.userId);
  if (!otherTeamHasPlayerWithApp) {
    winnerTeamNumber = getWinnerTeamNumber(sets);
  }

  if (!match.resultLoadedByTeam) {
    // Es la primera vez que se carga el resultado
    await prisma.set.createMany({
      data: sets
    });

    if (otherTeamHasPlayerWithApp)
      await publishResultCreated(
        match.id,
        otherTeam!.players.filter((p) => p.id).map((p) => p.id),
        resultLoadedByTeam
      );
  } else {
    // Se rechaza y actualiza el resultado
    // Para cada set en body.sets, actualiza el set existente o créalo si no existe
    for (let i = 0; i < body.sets.length; i++) {
      const setNumber = i + 1;
      const [team1Score, team2Score] = body.sets[i];

      // Buscar si el set ya existe
      const existingSet = await prisma.set.findFirst({
        where: {
          matchId: match.id,
          setNumber: setNumber
        }
      });

      if (existingSet) {
        // Actualizar el set existente
        await prisma.set.update({
          where: { id: existingSet.id },
          data: {
            team1Score,
            team2Score
          }
        });
      } else {
        // Crear el set si no existe
        await prisma.set.create({
          data: {
            matchId: match.id,
            setNumber,
            team1Score,
            team2Score
          }
        });
      }
    }

    if (otherTeamHasPlayerWithApp)
      await publishResultRejected(
        match.id,
        otherTeam!.players.filter((p) => p.id).map((p) => p.id),
        resultLoadedByTeam
      );
  }

  await prisma.match.update({
    where: { id: match.id },
    data: { resultLoadedByTeam, winnerTeamNumber }
  });
};

export const acceptMatchResult = async (
  match: MatchWithFullDetails,
  playerId: number | null,
  withNotification = true
) => {
  const winnerTeam = getWinnerTeamNumber(match.sets);
  await saveWinnerTeam(match.id, winnerTeam);
  if (winnerTeam === 0) return;
  if (match.gender.code !== GENDER.MIXTO) await updateRankings(match, winnerTeam);
  match.teams.forEach((t) => t.players.forEach(async (p) => await addConfidenceToPlayer(p)));

  if (withNotification)
    await publishResultAccepted(
      match.id,
      match.players!.filter((p) => p.id && p.id !== playerId).map((p) => p.id),
      match.resultLoadedByTeam!
    );
};

export const createMatchWithResult = async (
  playerId: number,
  data: CreateMatchWithResultDto,
  resultLoadedByTeam: number
) => {
  const { location, date, time, gender, category, teams, sets } = data;
  const createMatchBody = {
    location,
    date,
    time,
    genderId: gender,
    categoryId: category,
    teams
  };
  const match = await createMatch(playerId, createMatchBody, false, MATCH_STATUS.CLOSED);

  const createResultBody = {
    matchId: match.id,
    sets
  };
  await updateMatchResult(match as MatchWithFullDetails, createResultBody, resultLoadedByTeam);

  return match;
};
