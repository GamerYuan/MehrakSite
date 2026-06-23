import { validateGameParam } from "./index";

describe("router beforeEnter game validator", () => {
  it("accepts valid route keys", () => {
    expect(validateGameParam("genshin")).toBeUndefined();
    expect(validateGameParam("hsr")).toBeUndefined();
    expect(validateGameParam("zzz")).toBeUndefined();
    expect(validateGameParam("hi3")).toBeUndefined();
  });

  it("rejects invalid game keys", () => {
    expect(validateGameParam("tot")).toEqual({ name: "dashboard-home" });
    expect(validateGameParam("invalid")).toEqual({ name: "dashboard-home" });
    expect(validateGameParam("")).toEqual({ name: "dashboard-home" });
  });

  it("rejects TearsOfThemis which has routeKey null", () => {
    expect(validateGameParam(null)).toEqual({ name: "dashboard-home" });
  });
});
