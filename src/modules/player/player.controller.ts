import { Response } from 'express';
import { CreatePlayerRequest } from "../../types/playerTypes";
import { ErrorResponse, OkResponse } from '../../types/response';
import * as playerService from './player.service';
import { Request } from "../../types/common";

export const createplayer = async (req: Request<CreatePlayerRequest>, res: Response) => {
    try {
        const player = await playerService.createPlayer(req.body, req.user);
        res.status(200).json(new OkResponse(player));
    } catch (e: any) {
        console.error(e);
        res.status(500).json(new ErrorResponse("Error creating player", e));
    }
}