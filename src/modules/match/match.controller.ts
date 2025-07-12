import { Response } from "express";
import * as matchService from "./match.service";
import {
  AddPlayerToMatchRequest,
  DeletePlayerFromMatchRequest,
  GetMatchesRequest,
  MATCH_STATUS,
  MatchDto,
  UpdateMatchDto
} from "../../types/matchTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { getPlayerByUserId } from "../../utils/player";
import { GENDER } from "../../types/playerTypes";
import { parseMatches, parseMatchFilters, validateCreateMatchBody } from "../../utils/match";
import { Prisma } from "@prisma/client";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";

export const createMatch = async (req: Request<MatchDto>, res: Response) => {
  try {
    validateCreateMatchBody(req.body);
    const match = await matchService.createMatch(req.user.playerId!, req.body);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating match", e));
  }
};

export const getOpenMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    const filters = parseMatchFilters(req.query);
    if (!req.query.gender) {
      const user = req.user;
      const player: Prisma.PlayerGetPayload<{
        include: { gender: true };
      }> | null = await getPlayerByUserId(user.id, { gender: true });
      filters.genders = [player?.gender?.code as GENDER, GENDER.MIXTO];
    }

    const [matches, totalMatches] = await matchService.getOpenMatches(filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getCreatedMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    if (!req.user.playerId) throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getCreatedMatches(req.user.playerId, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getPlayedMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    if (!req.user.playerId) throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getPlayedMatches(req.user.playerId, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getAppliedMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    if (!req.user.playerId) throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getAppliedMatches(req.user.playerId, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const match = await matchService.getMatchById(matchId);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting match", e));
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const matchId = Number(req.params.id);

    // Obtener el partido actual para validaciones
    const currentMatch = await matchService.getMatchById(matchId);
    if (!currentMatch) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    // Solo el creador del partido puede eliminarlo
    if (currentMatch.creatorPlayerId !== req.user.playerId) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo el creador puede eliminar el partido",
            new CustomError("No autorizado", ErrorCode.UNAUTHORIZED)
          )
        );
      return;
    }

    const match = await matchService.deleteMatch(matchId);
    // TODO - notificar a jugadores
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error deleting match", e));
  }
};

export const addPlayerToMatch = async (req: Request<AddPlayerToMatchRequest>, res: Response) => {
  try {
    // Obtener el partido actual para validaciones
    const currentMatch = await matchService.getMatchById(req.body.matchId);
    if (!currentMatch) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    // Solo el creador del partido puede agregar jugadores
    if (currentMatch.creatorPlayerId !== req.user.playerId) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo el creador puede agregar jugadores al partido",
            new CustomError("No autorizado", ErrorCode.UNAUTHORIZED)
          )
        );
      return;
    }

    const match = await matchService.addPlayerToMatch(req.body);
    // TODO - notificar jugador
    if (match.players.length === 4) await matchService.changeState(req.body.matchId, MATCH_STATUS.CLOSED);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error adding player to match", e));
  }
};

export const updateMatch = async (req: Request<UpdateMatchDto>, res: Response) => {
  try {
    const matchId = Number(req.params.id);

    // Obtener el partido actual para validaciones
    const currentMatch = await matchService.getMatchById(matchId);
    if (!currentMatch) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    if (currentMatch.creatorPlayerId !== req.user.playerId) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo el creador puede editar el partido",
            new CustomError("No autorizado", ErrorCode.UNAUTHORIZED)
          )
        );
      return;
    }

    // TODO - Validar que el partido esté en estado PENDING para editar equipos
    // if (req.body.teams && currentMatch.status.code !== MATCH_STATUS.PENDING) {
    //   res
    //     .status(400)
    //     .json(
    //       new ErrorResponse(
    //         "Solo se pueden editar equipos en partidos pendientes",
    //         new CustomError("Estado inválido", ErrorCode.CREATE_MATCH_INCORRECT_BODY)
    //       )
    //     );
    //   return;
    // }

    // TODO - agregar validaciones de campos (fechas futuras, duración válida, etc.)

    const match = await matchService.updateMatch(matchId, req.body);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error updating match", e));
  }
};

export const deletePlayerFromMatch = async (req: Request<DeletePlayerFromMatchRequest>, res: Response) => {
  try {
    const currentMatch = await matchService.getMatchById(req.body.matchId);
    if (!currentMatch) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    // Solo puede eliminar el jugador el creador del partido o el jugador mismo
    if (currentMatch.creatorPlayerId !== req.user.playerId && req.user.playerId !== req.body.playerId) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo el creador puede editar el partido",
            new CustomError("No autorizado", ErrorCode.UNAUTHORIZED)
          )
        );
      return;
    }

    const match = await matchService.deletePlayerFromMatch(req.body);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error deleting player from match", e));
  }
};

export const getPlayedMatchesCount = async (req: Request, res: Response) => {
  try {
    if (!req.user.playerId) {
      throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    }

    const count = await matchService.getPlayedMatchesCount(req.user.playerId);
    res.status(200).json(new OkResponse({ count }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting player matches count", e));
  }
};
