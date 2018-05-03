import * as bytes from "bytes";
import Counter = require("passthrough-counter");
import { IDBContext } from "./handler";
import { deltaTime } from "./util";

export function Logger() {
  return async function logger(ctx, next) {
    // request
    const start = Date.now();

    ctx.logger.log("[Request]", {
      method: ctx.method,
      url: ctx.originalUrl
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

    function done(event) {
      res.removeListener("finish", onfinish);
      res.removeListener("close", onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }
  };
}

/**
 * Log helper.
 */

function log(ctx: IDBContext, start: number, len, err?, event?) {
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

  const upstream = err ? "xxx"
    : event === "close" ? "-x-"
    : "-->";

  ctx.logger.log(`[Response]`, {
    ...ctx,
    upstream,
    status,
    length,
    time: deltaTime(start)
  });
}
