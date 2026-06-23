import { gameMeta } from "../configs/gameMeta";

// Replicate the beforeEnter logic from src/router/index.js:80-87
// to test the validation in isolation. If the router file later exports
// this function directly, update this test to import it instead.
const validGameKeys = Object.values(gameMeta)
  .map((m) => m.routeKey)
  .filter(Boolean);

function validateGameParam(game) {
  if (!validGameKeys.includes(game)) {
    return { name: "dashboard-home" };
  }
  return undefined;
}

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
