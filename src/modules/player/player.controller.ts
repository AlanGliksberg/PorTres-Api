import { Response } from "express";
import { CreatePlayerBody, GetPlayersRequest } from "../../types/playerTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import * as playerService from "./player.service";
import { Request } from "../../types/common";
import { validateCreatePlayerBody, parsePlayerFilters } from "../../utils/player";

export const createPlayer = async (req: Request<CreatePlayerBody>, res: Response) => {
  try {
    validateCreatePlayerBody(req.body);
    const player = await playerService.createPlayer(req.body, req.user);
    res.status(200).json(new OkResponse({ player }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating player", e));
  }
};

export const getPlayers = async (req: Request<GetPlayersRequest>, res: Response) => {
  try {
    const filters = parsePlayerFilters(req.query);
    const players = await playerService.getPlayers(filters);
    res.status(200).json(new OkResponse({ players }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating player", e));
  }
};

export const getGenders = async (req: Request<{ filterBoth: string }>, res: Response) => {
  try {
    const genders = await playerService.getGenders(req.query.filterBoth === "true");
    res.status(200).json(new OkResponse({ genders }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting genders", e));
  }
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    const positions = await playerService.getPositions();
    res.status(200).json(new OkResponse({ positions }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting positions", e));
  }
};

export const getCategories = async (req: Request<{ filterBoth: string }>, res: Response) => {
  try {
    const categories = await playerService.getCategories(req.query.filterBoth === "true");
    res.status(200).json(new OkResponse({ categories }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting categories", e));
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await playerService.getQuestions();
    res.status(200).json(new OkResponse({ questions }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error getting questions", e));
  }
};
