import * as bytes from "bytes";
import Counter = require("passthrough-counter");
import * as util from "util";
import { IAuthenticatedHeader, IDBContext, ILogger } from "./handler";
import { deltaTime } from "./util";

export interface ILoggerOptions {
  printResponseBody?: boolean;
  censorRequestProperties?: string[];
  censorResponseProperties?: string[];
}

export function Logger(rawLogger: ILogger, options?: ILoggerOptions) {

  const {
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

    const payload = {
      status,
      length,
      err: err ? util.inspect(err) : undefined,
      type: "Response",
      method: ctx.method,
      url: ctx.originalUrl,
      origin: ctx.origin,
      header: ctx.debug ? ctx.response.header : undefined,
      body: (printResponseBody || ctx.debug) ? limitBody(
        sensorProperties(ctx.request.body, censorResponseProperties),
      ) : undefined,
      time: deltaTime(start),
    };

    err ? ctx.logger.error(payload) : ctx.logger.info(payload);
  }

  return async function logger(ctx: IDBContext, next: () => any) {
    // request
    const start = Date.now();
    const headers: IAuthenticatedHeader = ctx.request.headers;

    const requestId = headers["x-orchxtra-apigateway-request-id"] || Date.now();
    const tag = `[${ctx.method}] ${ctx.originalUrl} - ${requestId}`;

    ctx.logger = rawLogger;

    function logRequest() {

      ctx.logger.info({
        tag,
        type: "Request",
        method: ctx.method,
        url: ctx.originalUrl,
        header: ctx.debug ? ctx.request.header : undefined,
        body: ctx.debug ? limitBody(
          sensorProperties(ctx.request.body, censorRequestProperties),
        ) : undefined,
      });
    }

    try {
      await next();
      logRequest();
    } catch (err) {
      // log uncaught downstream errors
      logRequest();
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

  return props
    .reduce((acc, name) =>
      !acc[name]
      ? acc : { ...acc, [name]: "xxx" }, body);
}
