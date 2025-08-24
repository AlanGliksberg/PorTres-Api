import { ApplicationStatus, Prisma, User } from "@prisma/client";
import prisma from "../../prisma/client";
import {
  MatchDto,
  MatchFilters,
  MATCH_STATUS,
  AddPlayerToMatchRequest,
  UpdateMatchDto,
  DeletePlayerFromMatchRequest
} from "../../types/matchTypes";
import { createTeam, executeGetMatch, getCommonMatchInlcude, getDBFilter, updateTeams } from "../../utils/match";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { createOrGetPlayer, getPlayerById, verifyGenderById } from "../../utils/player";
import { APPLICATION_STATUS } from "../../types/application";
import { PlayerDTO } from "../../types/playerTypes";

export const createMatch = async (playerId: number, data: MatchDto) => {
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
      status: { connect: { code: matchStatus } },
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

export const getOpenMatches = async (filters: MatchFilters, playerId: number | undefined) => {
  const { page, pageSize } = filters;
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
          gte: new Date()
        }
      }
    ]
  };

  return await prisma.$transaction([
    prisma.match.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      include: {
        status: true,
        category: true,
        gender: true,
        players: true,
        teams: {
          include: {
            players: {
              include: {
                user: true
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
      },
      orderBy: {
        dateTime: "asc"
      }
    }),
    prisma.match.count({
      where
    })
  ]);
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
          position: true
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
          code: MATCH_STATUS.PENDING
        }
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    createdAt: "desc"
  };

  return await executeGetMatch(page, pageSize, where, include, orderBy);
};

export const getPlayedMatches = async (playerId: number, filters: MatchFilters) => {
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
      getDBFilter(filters),
      {
        status: {
          code: MATCH_STATUS.COMPLETED
        }
      }
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    createdAt: "desc"
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
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      getDBFilter(filters)
    ]
  };

  const orderBy: Prisma.MatchOrderByWithRelationInput = {
    createdAt: "desc"
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
};

export const deleteMatch = async (matchId: number) => {
  return await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          code: MATCH_STATUS.CANCELLED
        }
      }
    }
  });
};

export const addPlayerToMatch = async (data: AddPlayerToMatchRequest) => {
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

  // TODO - validar genero de jugador contra el genero de partido
  return await prisma.match.update({
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
};

export const changeState = async (matchId: number, status: MATCH_STATUS) => {
  return await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: {
        connect: {
          code: status
        }
      }
    }
  });
};

export const updateMatch = async (matchId: number, data: UpdateMatchDto) => {
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

    await updateTeams(matchId, data.teams, genderId);

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

export const deletePlayerFromMatch = async (data: DeletePlayerFromMatchRequest) => {
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
  }

  if (currentMatch.status.code !== MATCH_STATUS.PENDING) {
    await changeState(data.matchId, MATCH_STATUS.PENDING);
  }

  return updatedMatch;
};

export const getPlayedMatchesCount = async (playerId: number) => {
  const matchesCount = await prisma.match.count({
    where: {
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
            code: MATCH_STATUS.COMPLETED
          }
        }
      ]
    }
  });

  return matchesCount;
};
