export interface IPagingParams {
  page: number;
  pageSize: number | boolean;
  orderBy: string[][];
}

export interface IRequestQuery {
  [key: string]: string;
}

export function parseNormalInteger(str: string | number): number | false {
  let n: number;

  if (!str) {
    return false;
  }

  switch (typeof str) {
  case "number":
    n = <number> str;
    break;
  case "string":
    n = Math.floor(Number(str));
    break;
  default:
    return false;
  }

  return n !== Infinity && String(n) === str && n >= 0 ? n : false;
}

export function firstParam(param: string | string[]): string {
  return param && Array.isArray(param) ? param[0] : <string> param;
}

export function isEmail(email: string): boolean {

  // tslint:disable max-line-length
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // tslint:enable

  return re.test(String(email).toLowerCase());
}

export const PAGE_SIZE = 20;

export function parsePaginationQuery(params: IRequestQuery): IPagingParams {

  return {
    page: parseNormalInteger(firstParam(params.page)) || 1,
    pageSize: parseNormalInteger(firstParam(params.size)),
    orderBy: !params.sort ? [] : firstParam(params.sort).split(",")
      .map((m) => m.trim())
      .map((s) => s.substr(0, 1) === "-" ? [s.substr(1), "DESC"] : [s, "ASC"]),
  };
}

export function parseFilterQuery<T = object>(params: IRequestQuery): T {
  if (!params) {
    return <T> <any> {};
  }

  const regex = /filter\[(\w+)\]/;

  return <T> Object.keys(params)
    .reduce((res, k) => {
      const searchResult = regex.exec(k);
      if (!searchResult) {
        return res;
      }

      return {
        ...res,
        [searchResult[1]]: params[k]
      };
    }, {});
}

export interface IHumanizeNumberOptions {
  delimiter?: string;
  separator?: string;
}

export function humanizeNumber(n: number | string, options?: IHumanizeNumberOptions): string {
  const { delimiter = "," , separator = "." } = {
    ...options
  };

  const str = n.toString().split(".");
  str[0] = str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter);

  return str.join(separator);

}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

export function deltaTime(start: number): string {
  const delta = Date.now() - start;

  return humanizeNumber(delta < 10000
    ? delta + "ms"
    : Math.round(delta / 1000) + "s");
}

export interface IFileInput {
  data: Buffer;
  extension: string;
}

export function decodeBase64(input: string, fileType = "image"): IFileInput {
  const data = input.replace(/^data:/, "");
  const regex = new RegExp(`${fileType}\/[^;]+`);

  const type = data.match(regex);
  const base64 = data.replace(/^[^,]+,/, "");
  const extension = type ? type[0] : undefined;

  return {
    extension,
    data: Buffer.from(base64, "base64"),
  };
}

export function encodeBase64(
  input: ArrayBuffer, extension: string): string {
  const metadata = extension ? `data:${extension};base64,` : "";

  return metadata + Buffer.from(input).toString("base64");
}

/**
 * Parse query value to array
 * @param input 
 */
export function parseArrayQuery(input: string | string[]): string[] {

  return !input ? []
    : Array.isArray(input)
    ? input
      : typeof input === "string"
        ? input.split(",").map((s) => s.trim())
        : [input];

}

/** 
 * Unique array items
 */
export function uniq<T = any>(input: T[]): T[] {
  return input.reduce((acc: T[], item) =>
    acc.includes(item) ? acc : [...acc, item] , []);
}
