import { isPublicDocument } from "./publicContent";

const games = ["Genshin", "HSR"];
const validDocument = {
  id: "doc-1",
  name: "Build",
  description: "Generate a complete character build card.",
  game: "Genshin",
};

describe("isPublicDocument", () => {
  it("accepts a complete public command record", () => {
    expect(isPublicDocument(validDocument, games)).toBe(true);
  });
  it("accepts short but non-empty published descriptions from the docs API", () => {
    expect(isPublicDocument({ ...validDocument, description: "Test" }, games)).toBe(true);
  });

  it.each([
    null,
    {},
    { ...validDocument, id: "" },
    { ...validDocument, name: " " },
    { ...validDocument, description: "" },
    { ...validDocument, game: "Unsupported" },
    { ...validDocument, name: "Test command" },
    { ...validDocument, description: "Lorem ipsum placeholder content." },
  ])("rejects malformed or fixture-grade public records", (document) => {
    expect(isPublicDocument(document, games)).toBe(false);
  });
});
