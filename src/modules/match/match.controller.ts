import { Response } from 'express';
import * as matchService from './match.service';
import { MatchDTO } from '../../types/matchTypes';
import { ErrorResponse, OkResponse } from '../../types/response';
import { Request } from "../../types/common";

export const createMatch = async (req: Request<MatchDTO>, res: Response) => {
  try {
    const match = await matchService.createMatch(req.user, req.body);
    res.status(200).json(new OkResponse(match));
  } catch (e) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating match " + e));
  }
};

export const getMatches = async (_req: Request, res: Response) => {
  const matches = await matchService.getMatches();
  res.json(matches);
};
