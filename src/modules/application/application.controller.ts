import { ErrorCode } from "../../constants/errorCode";
import { AcceptApplicationBody, CreateApplicationBody } from "../../types/application";
import { CustomError } from "../../types/customError";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import { Response } from "express";
import * as applicationService from "./application.service";

export const applyToMatch = async (req: Request<CreateApplicationBody>, res: Response) => {
  try {
    if (
      !req.body.matchId ||
      !Number(req.body.matchId) ||
      (req.body.teamNumber && !(req.body.teamNumber === 1 || req.body.teamNumber === 2))
    )
      throw new CustomError("Invalid request", ErrorCode.APPLICATION_REQUEST_ERROR);

    const application = await applicationService.applyToMatch(req.user.playerId!, req.body);
    res.status(200).json(new OkResponse({ application }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error applying to match", e));
  }
};

export const acceptApplication = async (req: Request<AcceptApplicationBody>, res: Response) => {
  try {
    const applicationId = req.params.id as number;
    // TODO - validar que sea un numero
    const application = await applicationService.acceptApplication(
      req.user.playerId!,
      applicationId,
      req.body.teamNumber
    );
    res.status(200).json(new OkResponse({ application }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error accepting application", e));
  }
};

export const rejectApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id as string;
    const application = await applicationService.rejectApplication(req.user.playerId!, Number(applicationId));
    res.status(200).json(new OkResponse({ application }));
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error rejecting application", e));
  }
};
