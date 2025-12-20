import { Response } from "express";
import { Request } from "../../types/common";
import { BroadcastPushBody } from "../../types/notifications";
import { ErrorResponse, OkResponse } from "../../types/response";
import { parseBroadcastPushBody, validateBroadcastPushBody } from "../../utils/notifications";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import * as notificationsService from "./notifications.service";

export const sendBroadcastPush = async (req: Request<BroadcastPushBody>, res: Response) => {
  try {
    if (req.user.email !== "alanglik@gmail.com") {
      res
        .status(403)
        .json(new ErrorResponse("Usuario no autorizado", new CustomError("No autorizado", ErrorCode.UNAUTHORIZED)));
      return;
    }

    const parsedBody = parseBroadcastPushBody(req.body);
    validateBroadcastPushBody(parsedBody);

    const result = await notificationsService.sendBroadcastPush(parsedBody);
    res.status(200).json(new OkResponse({ result }));
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError && e.code === ErrorCode.BROADCAST_INCORRECT_BODY) {
      res.status(400).json(new ErrorResponse("Body incorrecto", e));
      return;
    }

    const error = e instanceof Error ? new CustomError(e.message) : new CustomError("Error enviando notificaciones");
    res.status(500).json(new ErrorResponse("Error enviando notificaciones", error));
  }
};
