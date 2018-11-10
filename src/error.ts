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

export class HandlerError extends Error {

  public name = "HandlerError";
  public status: number;
  public code: string;

  constructor(err: IError) {
    super(err.message);
    this.status = err.status || 500;
    this.code = err.code || ErrorCode.InternalError;
  }
}

export function catchHandlerError(
  ctx: IDBContext, err: HandlerError): void {
  if (ctx.debug || !err.status || err.status === 500) {
    ctx.logger.error(err);
  }

  ctx.status = err.status || 500;
  ctx.body = err;
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
    ctx.logger.error(e);
  }

  if (e.response) {
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  } else {
    ctx.throw(new HandlerError(<any> e));
  }
}
