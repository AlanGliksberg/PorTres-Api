import { Request, Response } from 'express';
import { PlayerDTO } from "../../types/playerTypes";
import { ErrorResponse, OkResponse } from '../../types/response';
import * as playerService from './player.service';

export const createplayer = async (req: Request<PlayerDTO>, res: Response) => {
    try {
        const player = await playerService.createPlayer(req.body, req.user);
        res.status(200).json(new OkResponse(player));
    } catch (e) {
        console.error(e);
        res.status(500).json(new ErrorResponse("Error creating player " + e));
    }
}