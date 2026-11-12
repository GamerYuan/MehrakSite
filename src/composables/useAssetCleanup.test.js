import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAssetCleanup } from "./useAssetCleanup";

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock("./useApi", () => ({ useApi: () => ({ apiFetch }) }));
const previewResult = (suffix = "_bg.png") => ({
  dryRun: true,
  suffix,
  matchedCount: 1,
  deletedCount: 0,
  failedCount: 0,
  backupLocation: null,
  keys: [{ key: `genshin/a${suffix}`, status: "matched" }],
});
const respond = (data, ok = true, status = 200) => ({ ok, status, json: async () => data });
const ready = async () => {
  const state = useAssetCleanup();
  state.suffix.value = "_bg.png";
  apiFetch.mockResolvedValueOnce(respond(previewResult()));
  await state.preview();
  state.confirmation.value = state.suffix.value;
  state.operationallyVerified.value = true;
  return state;
};

beforeEach(() => vi.resetAllMocks());

describe("asset cleanup safety", () => {
  it("preserves literal whitespace and sends an explicit dry run", async () => {
    const state = useAssetCleanup();
    state.suffix.value = " _BG.* ";
    apiFetch.mockResolvedValue(respond(previewResult(state.suffix.value)));
    await state.preview();
    expect(apiFetch).toHaveBeenCalledWith(
      "/assets/cleanup-by-suffix",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suffix: " _BG.* ", dryRun: true }),
        skipAuthRedirect: true,
      }),
    );
  });

  it.each(["", "   ", "\t.png", "x\u007f", "a".repeat(1025), "😀".repeat(513)])(
    "rejects invalid suffix without contacting storage",
    async (suffix) => {
      const state = useAssetCleanup();
      state.suffix.value = suffix;
      await state.preview();
      expect(state.validation.value).not.toBe("");
      expect(apiFetch).not.toHaveBeenCalled();
    },
  );

  it("requires a matching preview, exact confirmation and operational acknowledgement", async () => {
    const state = await ready();
    state.confirmation.value = "_BG.png";
    await state.execute();
    state.confirmation.value = "_bg.png";
    state.operationallyVerified.value = false;
    await state.execute();
    expect(apiFetch).toHaveBeenCalledTimes(1);
    state.suffix.value = "new.png";
    expect(state.result.value).toBeNull();
    state.suffix.value = "_bg.png";
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
    expect(JSON.parse(apiFetch.mock.calls[1][1].body).dryRun).toBe(false);
    const failed = {
      ...previewResult(),
      dryRun: false,
      failedCount: 1,
      keys: [{ key: "a_bg.png", status: "failed", errorCode: "source_modified" }],
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
    state.suffix.value = ".png";
    apiFetch.mockResolvedValueOnce(
      respond({ errors: { suffix: ["Invalid suffix."] } }, false, 400),
    );
    await state.preview();
    expect(state.error.value).toContain("Invalid suffix.");
    apiFetch.mockResolvedValueOnce(
      respond({ code: "listing_failed", error: "Listing failed." }, false, 502),
    );
    await state.preview();
    expect(state.error.value).toContain("listing_failed");
    expect(state.canExecute.value).toBe(false);
  });

  it("disallows execution with zero matches", async () => {
    const state = useAssetCleanup();
    state.suffix.value = ".png";
    apiFetch.mockResolvedValue(respond({ ...previewResult(".png"), matchedCount: 0, keys: [] }));
    await state.preview();
    expect(state.canExecute.value).toBe(false);
  });
});
