import * as bytes from "bytes";
import Counter = require("passthrough-counter");
import * as util from "util";
import { IAuthenticatedHeader, IDBContext } from "./handler";
import { deltaTime } from "./util";

export interface ILoggerOptions {
  bodySizeLimit?: number;
  printResponseBody?: boolean;
  censorRequestProperties?: string[];
  censorResponseProperties?: string[];
}

export function Logger(rawLogger, options?: ILoggerOptions) {

  const {
    bodySizeLimit = 50000,
    printResponseBody = false,
    censorRequestProperties = [],
    censorResponseProperties = []
  } = {
    ...options,
  };

  /**
   * Log helper.
   */
  function printResponse(ctx: IDBContext, start: number, len, err?) {
  // get the status code of the response
    const status = err
    ? (err.isBoom ? err.output.statusCode : err.status || 500)
    : (ctx.status || 404);

  // get the human readable response length
    let length;
    if ([204, 205, 304].indexOf(status) * -1) {
      length = "";
    } else if (!len) {
      length = "-";
    } else {
      const byteLen = bytes(len);
      length = byteLen ? byteLen.toString().toLowerCase() : "-";
    }

    ctx.logger.log({
      status,
      length,
      err: err ? util.inspect(err) : undefined,
      type: "Response",
      method: ctx.method,
      url: ctx.originalUrl,
      origin: ctx.origin,
      header: ctx.debug ? ctx.response.header : undefined,
      body: printResponseBody ? limitBody(

        sensorProperties(ctx.request.body, censorResponseProperties),
        bodySizeLimit
      ) : undefined,
      time: deltaTime(start),
    });
  }

  return async function logger(ctx: IDBContext, next: () => any) {
    // request
    const start = Date.now();
    const headers: IAuthenticatedHeader = ctx.request.headers;

    const requestId = headers["x-orchxtra-apigateway-request-id"] || Date.now();
    const tag = `[${ctx.method}] ${ctx.originalUrl} - ${requestId}`;

    const logTag = (_tag: string, payload: any) => {
      const _log = rawLogger.logTag || rawLogger.log;

      try {
        return _log(_tag, payload);
      } catch {
        return _log(_tag, util.inspect(payload));
      }
    };

    const newLogger = {
      logTag,
      log: (payload: any) => {
        return logTag(tag, payload);
      }
    };

    ctx.logger = newLogger;

    ctx.logger.log({
      type: "Request",
      method: ctx.method,
      url: ctx.originalUrl,
      header: ctx.debug ? ctx.request.header : undefined,
      body: ctx.debug ? limitBody(
        sensorProperties(ctx.request.body, censorRequestProperties),
        bodySizeLimit
      ) : undefined,
    });

    try {
      await next();
    } catch (err) {
      // log uncaught downstream errors
      printResponse(ctx, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    const length = ctx.response.length;
    const body = ctx.body;
    let counter;
    if (length === null && body && body.readable) {
      ctx.body = body
        .pipe(counter = Counter())
        .on("error", ctx.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    const res = ctx.res;

    const onfinish = done.bind(null, "finish");
    const onclose = done.bind(null, "close");

    res.once("finish", onfinish);
    res.once("close", onclose);

    function done() {
      res.removeListener("finish", onfinish);
      res.removeListener("close", onclose);

      printResponse(ctx, start, counter ? counter.length : length, null);
    }
  };
}

function limitBody(body: any, size = 10000): any {

  if (!body) {
    return body;
  }

  const result: string = typeof body === "object" ? JSON.stringify(body) : body.toString();

  return result.length < size ? body : result.substr(0, size);
}

function sensorProperties(body: any, props: string[]): any {
  if (typeof body !== "object") {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map((o) => sensorProperties(o, props));
  }

  return props.reduce((name) => !body[name] ? body : { ...body, [name]: "xxx" });
}
