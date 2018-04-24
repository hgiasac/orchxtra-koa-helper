export interface IPagingParams {
  page: number;
  pageSize: number;
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
  default:
    return false;
  }

  return n !== Infinity && String(n) === str && n >= 0 ? n : false;
}

export function firstParam(param: string | string[]): string {
  return param && Array.isArray(param) ? param[0] : <string> param;
}

export const PAGE_SIZE = 20;

export function parsePaginationQuery(params: IRequestQuery): IPagingParams {

  return {
    page: parseNormalInteger(firstParam(params.page)) || 1,
    pageSize: parseNormalInteger(firstParam(params.size)) || PAGE_SIZE,
    orderBy: !params.sort ? [] : firstParam(params.size).split(",")
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
