import { CustomError } from "./customError";

export interface CustomResponse {
  error: boolean;
  data: any;
  message?: string;
}

export class OkResponse implements CustomResponse {
  error: boolean;
  data: any;
  message?: string;

  constructor(data?: any) {
    this.error = false;
    this.data = data;
  }
}

export class ErrorResponse implements CustomResponse {
  error: boolean;
  data: any;
  message?: string;
  code?: number;

  constructor(message: string, e: CustomError, data?: any) {
    this.error = true;
    this.message = `${message}: ${e.message}`;
    this.code = e.code;
    this.data = data;
  }
}
