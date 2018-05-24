import * as bytes from "bytes";
import Counter = require("passthrough-counter");
import { AGW_REQUEST_ID_HEADER, IDBContext } from "./handler";
import { deltaTime } from "./util";

export function Logger(rawLogger) {

  return async function logger(ctx: IDBContext, next: () => any) {
    // request
    const start = Date.now();
    const requestId = ctx.headers[AGW_REQUEST_ID_HEADER] || Date.now();
    const tag = `[${ctx.method}] ${ctx.originalUrl} - ${requestId}`;

    const logTag = rawLogger.logTag || rawLogger.log;
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
      body: ctx.debug ? ctx.request.body : undefined,
    });

    try {
      await next();
    } catch (err) {
      // log uncaught downstream errors
      log(ctx, start, null, err);
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
      log(ctx, start, counter ? counter.length : length, null);
    }
  };
}

/**
 * Log helper.
 */

function log(ctx: IDBContext, start: number, len, err?) {
  // get the status code of the response
  const status = err
    ? (err.isBoom ? err.output.statusCode : err.status || 500)
    : (ctx.status || 404);

  // get the human readable response length
  let length;
  if ([204, 205, 304].indexOf(status) * -1) {
    length = "";
  } else if (len === null) {
    length = "-";
  } else {
    length = bytes(len).toLowerCase();
  }

  ctx.logger.log({
    status,
    length,
    err,
    type: "Response",
    method: ctx.method,
    url: ctx.originalUrl,
    origin: ctx.origin,
    header: ctx.debug ? ctx.response.header : undefined,
    body: ctx.debug ? ctx.response.body : undefined,
    time: deltaTime(start),
  });
}
