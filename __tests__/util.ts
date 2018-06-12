// tslint:disable no-implicit-dependencies

import "jest";
import { firstParam, parseNormalInteger, parsePaginationQuery } from "../src";

describe("Get User tests", () => {

  it("Positive firstParam", (done) => {

    expect(firstParam("test")).toEqual("test");
    expect(firstParam(["test"])).toEqual("test");

    done();
  });

  it("Positive - parseNormalInteger", (done) => {
    expect(parseNormalInteger("10")).toEqual(10);
    done();
  });

  it("Positive - parsePaginationQuery", (done) => {
    expect(parsePaginationQuery({
      page: "1",
      size: "10",
      sort: "-id"
    })).toEqual({
      page: 1,
      pageSize: 10,
      orderBy: [[ "id", "DESC" ]]
    });

    done();
  });
});
