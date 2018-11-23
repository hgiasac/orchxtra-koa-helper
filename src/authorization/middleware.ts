import { Context } from "koa";
import { parseArrayQuery, uniq } from "../util";

export function getPermissionName(
  parts: string[]): string {

  return parts.length < 3
    ? [...parts, "*"].join(".")
    : parts.join(".");
}

export interface IAuthorizationOptions {
  accept: string[];
}

export function userCan(permissions: string | string[], accept: string[]): boolean {

  if (!permissions || !permissions.length) {
    return false;
  }

  const perms = parseArrayQuery(permissions);

  const acceptParts = [].concat(...accept
  .map((s) => s.split("."))
  .map((ss) => [
    ...Array(ss.length).keys()
  ].splice(1)
  .map((n) => [...ss.slice(0, n), "*"].join(".")))
);

  const acceptModules = [
    ...uniq(acceptParts),
    ...accept,
  ];

  return acceptModules.some((k) => perms.includes(k));
}
export function AuthorizationMiddleware(
  options: IAuthorizationOptions
) {
  return (ctx: Context, next: () => any) => {

    const permissionHeader: string = ctx.headers["x-orchxtra-permissions"];

    if (userCan(permissionHeader, options.accept)) {
      return next();
    }

    ctx.status = 403;
    ctx.body = {
      message: "Permission Denied",
    };
  };
}
