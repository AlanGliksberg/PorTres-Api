import { ErrorCode } from "../constants/errorCode";

export class CustomError extends Error {
  code?: ErrorCode;

  constructor(message: string, code?: ErrorCode) {
    super();
    this.message = message;
    this.code = code;
  }
}
