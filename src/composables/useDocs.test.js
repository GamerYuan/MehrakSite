import { documentList, normalizeDocument, normalizeGame } from "./useDocs";

describe("documentation list normalization", () => {
  it("normalizes route-key and PascalCase API records", () => {
    expect(normalizeGame("genshin")).toBe("Genshin");
    expect(
      normalizeDocument({
        Id: "doc-1",
        Name: "/genshin character ",
        Description: "Generate a Genshin character card.",
        Game: "genshin",
      }),
    ).toMatchObject({
      id: "doc-1",
      name: "genshin character",
      game: "Genshin",
    });
  });

  it("accepts common collection response envelopes", () => {
    const record = { id: "doc-1" };
    expect(documentList([record])).toEqual([record]);
    expect(documentList({ documents: [record] })).toEqual([record]);
    expect(documentList({ items: [record] })).toEqual([record]);
    expect(documentList({ results: [record] })).toEqual([record]);
    expect(documentList({ $values: [record] })).toEqual([record]);
  });
});
