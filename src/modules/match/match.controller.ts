import { Response } from "express";
import * as matchService from "./match.service";
import { GetMatchesRequest, MatchDTO, MatchFilters } from "../../types/matchTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { getPlayerByUserId } from "../../utils/player";
import { GENDER } from "../../types/playerTypes";
import { parseMatches, parseMatchFilters } from "../../utils/match";

export const createMatch = async (req: Request<MatchDTO>, res: Response) => {
  try {
    const match = await matchService.createMatch(req.user, req.body);
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
      const player = await getPlayerByUserId(user.id);
      filters.genders = [player?.gender as GENDER, GENDER.X];
    }

    const matches = await matchService.getOpenMatches(filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getMyMatches = async (req: Request<GetMatchesRequest>, res: Response) => {
  try {
    const filters = parseMatchFilters(req.query);
    const user = req.user;
    const player = await getPlayerByUserId(user.id);

    const matches = await matchService.getMyMatches(player!, filters);
    const parsedMatches = parseMatches(matches);
    res.status(200).json(new OkResponse({ matches: parsedMatches }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id;
    const match = await matchService.getMatchById(matchId);
    res.status(200).json(new OkResponse({ match }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting match", e));
  }
};
