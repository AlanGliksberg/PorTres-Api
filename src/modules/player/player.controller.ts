import { Response } from "express";
import { CreatePlayerBody, GetPlayersRequest } from "../../types/playerTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import * as playerService from "./player.service";
import { Request } from "../../types/common";
import { validateCreatePlayerBody, parsePlayerFilters } from "../../utils/player";

export const createplayer = async (req: Request<CreatePlayerBody>, res: Response) => {
  try {
    validateCreatePlayerBody(req.body);
    const player = await playerService.createPlayer(req.body, req.user);
    res.status(200).json(new OkResponse({ player }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating player", e));
  }
};

export const getplayers = async (req: Request<GetPlayersRequest>, res: Response) => {
  try {
    const filters = parsePlayerFilters(req.query);
    const player = await playerService.getPlayers(filters);
    res.status(200).json(new OkResponse({ player }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating player", e));
  }
};
