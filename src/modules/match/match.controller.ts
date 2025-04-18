import { Request, Response } from 'express';
import * as matchService from './match.service';

export const createMatch = async (req: Request, res: Response) => {
  const match = await matchService.createMatch(req.body);
  res.status(201).json(match);
};

export const getMatches = async (_req: Request, res: Response) => {
  const matches = await matchService.getMatches();
  res.json(matches);
};
