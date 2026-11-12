import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAssetCleanup } from "./useAssetCleanup";

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock("./useApi", () => ({ useApi: () => ({ apiFetch }) }));
const previewResult = (prefix = "genshin/") => ({
  dryRun: true,
  prefix,
  matchedCount: 1,
  deletedCount: 0,
  failedCount: 0,
  backupLocation: null,
  keys: [{ key: `${prefix}example_bg.png`, status: "matched" }],
});
const respond = (data, ok = true, status = 200) => ({ ok, status, json: async () => data });
const ready = async () => {
  const state = useAssetCleanup();
  state.prefix.value = "genshin/";
  apiFetch.mockResolvedValueOnce(respond(previewResult()));
  await state.preview();
  state.confirmation.value = state.prefix.value;
  state.operationallyVerified.value = true;
  return state;
};

beforeEach(() => vi.resetAllMocks());

describe("asset cleanup safety", () => {
  it("preserves literal whitespace and sends an explicit dry run", async () => {
    const state = useAssetCleanup();
    state.prefix.value = " Genshin/.* ";
    apiFetch.mockResolvedValue(respond(previewResult(state.prefix.value)));
    await state.preview();
    expect(apiFetch).toHaveBeenCalledWith(
      "/assets/cleanup-by-prefix",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: " Genshin/.* ", dryRun: true }),
        skipAuthRedirect: true,
      }),
    );
  });

  it.each(["", "   ", "\t.png", "x\u007f", "a".repeat(1025), "😀".repeat(513)])(
    "rejects invalid prefix without contacting storage",
    async (prefix) => {
      const state = useAssetCleanup();
      state.prefix.value = prefix;
      await state.preview();
      expect(state.validation.value).not.toBe("");
      expect(apiFetch).not.toHaveBeenCalled();
    },
  );

  it("requires a matching preview, exact confirmation and operational acknowledgement", async () => {
    const state = await ready();
    state.confirmation.value = "Genshin/";
    await state.execute();
    state.confirmation.value = "genshin/";
    state.operationallyVerified.value = false;
    await state.execute();
    expect(apiFetch).toHaveBeenCalledTimes(1);
    state.prefix.value = "hsr/";
    expect(state.result.value).toBeNull();
    state.prefix.value = "genshin/";
    expect(state.canExecute.value).toBe(false);
  });

  it("prevents duplicate execution and treats HTTP 200 failures as outcomes", async () => {
    const state = await ready();
    let finish = null;
    apiFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const execution = state.execute();
    await state.execute();
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch.mock.calls[1][0]).toBe("/assets/cleanup-by-prefix");
    expect(JSON.parse(apiFetch.mock.calls[1][1].body)).toEqual({
      prefix: "genshin/",
      dryRun: false,
    });
    const failed = {
      ...previewResult(),
      dryRun: false,
      failedCount: 1,
      keys: [{ key: "genshin/example_bg.png", status: "failed", errorCode: "source_modified" }],
    };
    finish(respond(failed));
    await execution;
    expect(state.result.value.failedCount).toBe(1);
    expect(state.result.value.keys[0].errorCode).toBe("source_modified");
    expect(state.canExecute.value).toBe(false);
  });

  it("never retries a lost destructive request and requires a fresh preview", async () => {
    const state = await ready();
    apiFetch.mockRejectedValueOnce(new Error("Connection lost"));
    await state.execute();
    expect(state.error.value).toContain("may have partially completed");
    expect(state.result.value).toBeNull();
    await state.execute();
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

  it("renders framework validation errors and configuration failure codes", async () => {
    const state = useAssetCleanup();
    state.prefix.value = "genshin/";
    apiFetch.mockResolvedValueOnce(
      respond({ errors: { prefix: ["Invalid prefix."] } }, false, 400),
    );
    await state.preview();
    expect(state.error.value).toContain("Invalid prefix.");
    apiFetch.mockResolvedValueOnce(
      respond({ code: "listing_failed", error: "Listing failed." }, false, 502),
    );
    await state.preview();
    expect(state.error.value).toContain("listing_failed");
    expect(state.canExecute.value).toBe(false);
  });

  it("rejects a preview for a different prefix before enabling deletion", async () => {
    const state = useAssetCleanup();
    state.prefix.value = "genshin/";
    apiFetch.mockResolvedValueOnce(respond(previewResult("hsr/")));
    await state.preview();
    expect(state.error.value).toContain("invalid cleanup result");
    expect(state.result.value).toBeNull();
    state.confirmation.value = "genshin/";
    state.operationallyVerified.value = true;
    await state.execute();
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it("disallows execution with zero matches", async () => {
    const state = useAssetCleanup();
    state.prefix.value = "genshin/";
    apiFetch.mockResolvedValue(
      respond({ ...previewResult("genshin/"), matchedCount: 0, keys: [] }),
    );
    await state.preview();
    expect(state.canExecute.value).toBe(false);
  });
});
