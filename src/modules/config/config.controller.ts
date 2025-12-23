import { Response } from "express";
import { ErrorCode } from "../../constants/errorCode";
import { CustomError } from "../../types/customError";
import { ErrorResponse, OkResponse } from "../../types/response";
import { Request } from "../../types/common";
import * as configService from "./config.service";

export const getConfig = async (_req: Request, res: Response) => {
  try {
    const config = await configService.getLatestConfig();
    console.log({ config });

    if (!config) {
      res
        .status(404)
        .json(
          new ErrorResponse(
            "Configuración no encontrada",
            new CustomError("Configuración no encontrada", ErrorCode.CONFIG_NOT_FOUND)
          )
        );
      return;
    }

    res.status(200).json(
      new OkResponse({
        iosMinVersion: config.iosMinVersion,
        androidMinVersion: config.androidMinVersion
      })
    );
  } catch (e: any) {
    console.error(e);
    res.status(500).json(new ErrorResponse("Error obteniendo configuración", e));
  }
};
