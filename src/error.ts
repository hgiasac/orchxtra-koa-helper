import { IDBContext } from "./handler";

export enum ErrorCode {
  NotFound = "not_found",
  InternalError = "internal_error",
}

export interface IError {
  status: number;
  code: string;
  message: string;
}

export function catchHandlerError(
  ctx: IDBContext, err: Error | IError): never {
  if (ctx.debug || !(<IError> err).status || (<IError> err).status === 500) {
    ctx.logger.log(err);
  }

  return ctx.throw(
    (<IError> err).status || 500, {
      code: (<IError> err).code || ErrorCode.InternalError,
      message: err.message,
    }
  );
}

export interface IHttpError {
  message: string;
  response?: {
    status: number;
    data: any;
  };
}

export function catchHTTPRequestException(
  ctx: IDBContext, e: IHttpError) {
  if (ctx.debug || !e.response) {
    ctx.logger.log(e);
  }

  if (e.response) {
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  } else {
    ctx.throw(500, e.message);
  }
}
