import * as Knex from "knex";
import { Context, Request } from "koa";

export interface ILogger {
  log: (payload: any) => void;
  logTag: (tag: string, payload: any) => void;
}

export interface IRequest<T = any> extends Request {
  body: T;
}

export interface IDBContext<T = any> extends Context {
  request: IRequest<T>;
  debug: boolean;
  db: Knex;
  logger: ILogger;
}

export interface IAuthenticatedHeader {
  [key: string]: string;
  "x-orchxtra-apigateway-request-id": string;
  "x-orchxtra-cognito-username": string;
  "x-orchxtra-user-id": string;
  "x-orchxtra-service-account-id": string;
  "x-orchxtra-display-name": string;
  "x-orchxtra-email": string;
}
