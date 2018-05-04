import * as Knex from "knex";
import { Context } from "koa";

export interface ILogger {
  log: (tag: string, payload: any) => void;
}

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
