import { ErrorCode } from "../../constants/errorCode";
import { CreateApplicationBody } from "../../types/application";
import { CustomError } from "../../types/customError";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { Response } from "express";
import * as applicationService from "./application.service";

export const applyToMatch = async (req: Request<CreateApplicationBody>, res: Response) => {
  try {
    if (!req.body.matchId || !req.body.teamNumber || !(req.body.teamNumber === 1 || req.body.teamNumber === 2))
      throw new CustomError("Invalid request", ErrorCode.APPLICATION_REQUEST_ERROR);

    const application = await applicationService.applyToMatch(req.user, req.body);
    res.status(200).json(new OkResponse({ application }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error creating match", e));
  }
};
