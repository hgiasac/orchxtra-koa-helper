import * as Knex from "knex";
import { Context } from "koa";

export interface IDBContext extends Context {
  db: Knex;
}
