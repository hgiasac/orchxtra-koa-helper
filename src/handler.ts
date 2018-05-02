import * as Knex from "knex";
import { Context } from "koa";

export interface ILogger {
  log: (tag: string, payload: any) => void;
}

export interface IDBContext extends Context {
  db: Knex;
  logger: ILogger;
}
