import { Response } from 'express';
import * as matchService from './match.service';
import { MatchDTO } from '../../types/matchTypes';
import { ErrorResponse, OkResponse } from '../../types/response';
import { Request } from "../../types/common";

export const createMatch = async (req: Request<MatchDTO>, res: Response) => {
  try {
    const match = await matchService.createMatch(req.user, req.body);
    res.status(200).json(new OkResponse(match));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating match", e));
  }
};

export const getOpenMatches = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);

    const matches = await matchService.getMatches(pageNumber, pageSizeNumber);
    res.json(matches);
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting matches", e));
  }
};
