import { Response } from "express";
import * as matchService from "./match.service";
import {
  AcceptResultDto,
  AddPlayerToMatchRequest,
  CreateMatchWithResultDto,
  DeletePlayerFromMatchRequest,
  GetMatchesRequest,
  MATCH_STATUS,
  MatchDto,
  UpdateMatchDto,
  UpdateMatchResultDto
} from "../../types/matchTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { parseMatches, parseMatchFilters, validateCreateMatchBody } from "../../utils/match";
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

export const getMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    const filters = parseMatchFilters(req.query);

    const [matches, totalMatches] = await matchService.getOpenMatches(filters, req.user.playerId);
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

export const getMyMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    if (!req.user.playerId) throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getMyMatches(req.user.playerId, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting my matches", e));
  }
};

export const getMyPendingResults = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    if (!req.user.playerId) throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getMyPendingResults(req.user.playerId, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches, totalMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting my pending results matches", e));
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

    const match = await matchService.deleteMatch(matchId, req.user.playerId);
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

    const match = await matchService.addPlayerToMatch(req.body, req.user.playerId!);
    // TODO - notificar jugador
    if (match.players.length === 4) await matchService.changeState(req.body.matchId, MATCH_STATUS.COMPLETED);
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

    // TODO - Validar que el partido esté en estado PENDING o COMPLETED para editar equipos
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

export const updateResult = async (req: Request<UpdateMatchResultDto>, res: Response) => {
  try {
    if (!req.user.playerId) {
      throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    }
    const matchId = req.body.matchId;
    const match = await matchService.getMatchById(matchId);

    if (!match) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    const isMatchPlayer = match.teams.find((team) => team.players.some((player) => player.id === req.user.playerId));

    if (!isMatchPlayer) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo los jugadores del partido pueden modificar el resultado",
            new CustomError("No autorizado", ErrorCode.USER_NOT_PLAYER)
          )
        );
      return;
    }

    // TODO - validar que el resultado sea válido

    await matchService.updateMatchResult(match, req.body, isMatchPlayer.teamNumber);
    res.status(200).json(new OkResponse());
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error updating match result", e));
  }
};

export const acceptResult = async (req: Request<AcceptResultDto>, res: Response) => {
  try {
    if (!req.user.playerId) {
      throw new CustomError("Not a player", ErrorCode.USER_NOT_PLAYER);
    }
    const matchId = req.body.matchId;
    const match = await matchService.getMatchById(matchId);

    if (!match) {
      res
        .status(404)
        .json(new ErrorResponse("Partido no encontrado", new CustomError("Partido no encontrado", ErrorCode.NO_MATCH)));
      return;
    }

    const isMatchPlayer = match.teams.find((team) => team.players.some((player) => player.id === req.user.playerId));

    if (!isMatchPlayer) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo los jugadores del partido pueden modificar el resultado",
            new CustomError("No autorizado", ErrorCode.USER_NOT_PLAYER)
          )
        );
      return;
    }

    await matchService.acceptMatchResult(match);
    res.status(200).json(new OkResponse());
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error accepting match result", e));
  }
};

export const createMatchWithResult = async (req: Request<CreateMatchWithResultDto>, res: Response) => {
  try {
    // TODO - validar datos de entrada
    const teams = [req.body.teams.team1!, req.body.teams.team2!];
    let playerTeamNumber = 0;
    if (req.body.teams.team1!.some((p) => p.id === req.user.playerId)) playerTeamNumber = 1;
    else if (req.body.teams.team2!.some((p) => p.id === req.user.playerId)) playerTeamNumber = 2;

    if (!playerTeamNumber) {
      res
        .status(403)
        .json(
          new ErrorResponse(
            "Solo los jugadores del partido pueden modificar el resultado",
            new CustomError("No autorizado", ErrorCode.USER_NOT_PLAYER)
          )
        );
      return;
    }
    const match = await matchService.createMatchWithResult(req.user.playerId!, req.body, playerTeamNumber);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating match with result", e));
  }
};
