export interface CustomResponse {
    error: boolean;
    data: any;
    message?: string;
}

export class OkResponse implements CustomResponse {
    error: boolean;
    data: any;
    message?: string;
    constructor(data: any) {
        this.error = false;
        this.data = data;
    }
}

export class ErrorResponse implements CustomResponse {
    error: boolean;
    data: any;
    message?: string;
    constructor(message: string, data?: any) {
        this.error = true;
        this.message = message
        this.data = data;
    }
}