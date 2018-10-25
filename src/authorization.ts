import { Context } from "koa";
import { uniq } from "./util";

export interface IAuthorizationOptions {
  accept: string[];
}

export function AuthorizationMiddleware(
  options: IAuthorizationOptions
) {
  return (ctx: Context, next: () => any) => {

    const permissionHeader: string = ctx.headers["x-orchxtra-permissions"];

    const permissions = !permissionHeader ? [] :
      permissionHeader
        .split(",")
        .map((s) => s.trim());

    const acceptParts = [].concat(...options.accept
      .map((s) => s.split("."))
      .map((ss) => [
        ...Array(ss.length).keys()
      ].splice(1)
      .map((n) => [...ss.slice(0, n), "*"].join(".")))
    );

    const acceptModules = [
      ...uniq(acceptParts),
      ...options.accept,
    ];

    if (acceptModules.some((k) => permissions.includes(k))) {
      return next();
    }

    ctx.status = 403;
    ctx.body = {
      message: "Permission Denied",
    };
  };
}
