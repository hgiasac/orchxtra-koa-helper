import { AxiosError } from "axios";
import * as Knex from "knex";
import { Context } from "koa";

export interface ILogger {
  log: (tag: string, payload: any) => void;
}

export const AGW_REQUEST_ID_HEADER = "x-amzn-apigateway-request-id";
export const COGNITO_USERNAME_HEADER = "x-amzn-cognito-username";

export interface IDBContext extends Context {
  debug: boolean;
  db: Knex;
  logger: ILogger;
}

export interface IAuthenticatedHeader {
  [key: string]: string;
  "x-amzn-apigateway-request-id": string;
  "x-amzn-cognito-username": string;
}

export function catchHTTPRequestException(ctx: IDBContext, e: AxiosError) {
  if (e.response) {
    ctx.status = e.response.status;
    ctx.body = e.response.data;
  } else {
    ctx.throw(500, e.message);
  }
}
