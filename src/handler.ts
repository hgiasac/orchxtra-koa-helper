import { AxiosError } from "axios";
import * as Knex from "knex";
import { Context, Request } from "koa";

export interface ILogger {
  log: (payload: any) => void;
  logTag: (tag: string, payload: any) => void;
}

export const AGW_REQUEST_ID_HEADER = "x-amzn-apigateway-request-id";
export const COGNITO_USERNAME_HEADER = "x-amzn-cognito-username";

export interface IDBContextState {
  debug: boolean;
  db: Knex;
  logger: ILogger;
}

export interface IRequest<T = any> extends Request {
  body: T;
}

export interface IDBContext<T = any> extends Context {
  state: IDBContextState;
  request: IRequest<T>;
}

export interface IAuthenticatedHeader {
  [key: string]: string;
  "x-amzn-apigateway-request-id": string;
  "x-amzn-cognito-username": string;
}

export function catchHTTPRequestException(ctx: IDBContext, e: AxiosError) {
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
