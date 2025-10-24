import { Response } from "express";
import { CreatePlayerBody, UpdatePlayerBody, GetPlayersRequest, SaveExpoPushTokenBody } from "../../types/playerTypes";
import { ErrorResponse, OkResponse } from "../../types/response";
import * as playerService from "./player.service";
import { Request } from "../../types/common";
import {
  validateCreatePlayerBody,
  validateUpdatePlayerBody,
  parsePlayerFilters,
  validateExpoPushTokenBody
} from "../../utils/player";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";

export const createPlayer = async (req: Request<CreatePlayerBody>, res: Response) => {
  try {
    // TODO - agregar apodo
    validateCreatePlayerBody(req.body);
    const player = await playerService.createPlayer(req.body, req.user);
    res.status(200).json(new OkResponse({ player }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating player", e));
  }
};

export const updatePlayer = async (req: Request<UpdatePlayerBody>, res: Response) => {
  try {
    validateUpdatePlayerBody(req.body);
    const player = await playerService.updatePlayer(req.body, req.user);
    res.status(200).json(new OkResponse({ player }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error actualizando jugador", e));
  }
};

export const getCurrentPlayer = async (req: Request, res: Response) => {
  try {
    const player = await playerService.getCurrentPlayer(req.user);

    if (!player) {
      const error = new CustomError("Jugador no encontrado", ErrorCode.NO_PLAYER);
      res.status(404).json(new ErrorResponse("Jugador no encontrado", error));
    } else {
      res.status(200).json(new OkResponse({ player }));
    }
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error obteniendo jugador", e));
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

export const saveExpoPushToken = async (req: Request<SaveExpoPushTokenBody>, res: Response) => {
  try {
    validateExpoPushTokenBody(req.body);
    const expoPushToken = await playerService.saveExpoPushToken(req.body, req.user);
    res.status(200).json(new OkResponse({ expoPushToken }));
  } catch (e: any) {
    console.error(e);
    if (e instanceof CustomError && e.code === ErrorCode.NO_PLAYER) {
      res.status(404).json(new ErrorResponse("Jugador no encontrado", e));
    } else if (e instanceof CustomError && e.code === ErrorCode.INVALID_PUSH_TOKEN) {
      res.status(400).json(new ErrorResponse("Token push invalido", e));
    } else {
      res.status(500).json(new ErrorResponse("Error guardando token push", e));
    }
  }
};
