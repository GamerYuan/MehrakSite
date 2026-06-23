import { buildError } from "./useApi";

describe("buildError", () => {
  it("creates an Error with message and status", () => {
    const err = buildError("Not found", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
  });

  it("works with undefined status", () => {
    const err = buildError("Something went wrong");
    expect(err.message).toBe("Something went wrong");
    expect(err.status).toBeUndefined();
  });
});
