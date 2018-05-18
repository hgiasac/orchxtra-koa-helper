import { Context } from "koa";

export function healthCheckMiddleware(ctx: Context, next: () => any) {

  const userAgent: string = ctx.header["user-agent"];

  if (!userAgent || userAgent.indexOf("ELB-HealthChecker/") !== 0) {
    return next();
  }

  ctx.status = 200;
}
