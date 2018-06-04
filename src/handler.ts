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

export async function findServiceAccountModel(
  ctx: IDBContext,
  builder: (knex: Knex) => Knex.QueryBuilder,
  id: string,
  required = false
) {

  const headers: IAuthenticatedHeader = ctx.headers;
  const serviceAccountId = headers["x-orchxtra-service-account-id"];
  const model = await builder(ctx.db)
    .select("*")
    .where("id", id)
    .limit(1);

  if (!model || !model.length) {
    if (!required) {
      return null;
    }
    ctx.throw(400, `Can not find model by ID: ${id}`);
  }

  if (model.serviceAccountId !== serviceAccountId) {
    ctx.throw(403);
  }

  return model[0];
}
