import { Response } from "express";
import * as matchService from "./match.service";
import {
  AddPlayerToMatchRequest,
  GetMatchesRequest,
  MATCH_STATUS,
  MatchDto,
  MatchFilters
} from "../../types/matchTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { getPlayerByUserId } from "../../utils/player";
import { GENDER } from "../../types/playerTypes";
import { parseMatches, parseMatchFilters, validateCreateMatchBody } from "../../utils/match";
import { Prisma } from "@prisma/client";

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

export const getMyMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    const filters = parseMatchFilters(req.query);
    const [matches, totalMatches] = await matchService.getMyMatches(req.user.playerId!, filters);
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
    const match = await matchService.deleteMatch(matchId);
    // TODO - notificar a jugadores
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting match", e));
  }
};

export const addPlayerToMatch = async (req: Request<AddPlayerToMatchRequest>, res: Response) => {
  try {
    // TODO - agregar validaciones de campos
    // solo el creador del partido puede agregar jugadores
    const match = await matchService.addPlayerToMatch(req.body);
    // TODO - notificar jugador
    if (match.players.length === 4) await matchService.changeState(req.body.matchId, MATCH_STATUS.COMPLETED);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error adding player to match", e));
  }
};
