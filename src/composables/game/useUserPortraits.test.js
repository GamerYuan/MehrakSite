import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiFetchJson, handleApiError } = vi.hoisted(() => ({
  apiFetchJson: vi.fn(),
  handleApiError: vi.fn(),
}));

vi.mock("../useApi", () => ({
  useApi: () => ({
    apiFetchJson,
    handleApiError,
    apiFetch: vi.fn(),
    buildError: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
  }),
}));

import { useUserPortraits } from "./useUserPortraits";

const deferred = () => {
  let resolve = null;
  let reject = null;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useUserPortraits", () => {
  beforeEach(() => {
    apiFetchJson.mockReset();
    handleApiError.mockReset();
    handleApiError.mockReturnValue(false);
  });

  it("clears the previous list and selection before loading a character", async () => {
    const request = deferred();
    apiFetchJson.mockReturnValue(request.promise);
    const portraits = useUserPortraits({ id: "Genshin" });
    portraits.userPortraits.value = [{ id: "old" }];
    portraits.userPortraitId.value = "old";

    const pending = portraits.fetchUserPortraits("Amber");

    expect(portraits.userPortraits.value).toEqual([]);
    expect(portraits.userPortraitId.value).toBeNull();
    expect(portraits.userPortraitsCharacter.value).toBe("Amber");
    expect(portraits.userPortraitsLoading.value).toBe(true);

    request.resolve({ ok: true, data: [{ id: "amber", isActive: true }] });
    await pending;

    expect(portraits.userPortraits.value).toEqual([{ id: "amber", isActive: true }]);
    expect(portraits.userPortraitId.value).toBe("amber");
    expect(portraits.userPortraitsLoading.value).toBe(false);
  });

  it("ignores a stale response and finally after a newer character request wins", async () => {
    const amberRequest = deferred();
    const lumineRequest = deferred();
    apiFetchJson
      .mockReturnValueOnce(amberRequest.promise)
      .mockReturnValueOnce(lumineRequest.promise);
    const portraits = useUserPortraits({ id: "Genshin" });

    const amberPending = portraits.fetchUserPortraits("Amber");
    const luminePending = portraits.fetchUserPortraits("Lumine");

    lumineRequest.resolve({ ok: true, data: [{ id: "lumine", isActive: true }] });
    await luminePending;
    expect(portraits.userPortraits.value).toEqual([{ id: "lumine", isActive: true }]);
    expect(portraits.userPortraitId.value).toBe("lumine");
    expect(portraits.userPortraitsLoading.value).toBe(false);

    amberRequest.resolve({ ok: true, data: [{ id: "amber", isActive: true }] });
    await amberPending;

    expect(portraits.userPortraits.value).toEqual([{ id: "lumine", isActive: true }]);
    expect(portraits.userPortraitId.value).toBe("lumine");
    expect(portraits.userPortraitsCharacter.value).toBe("Lumine");
    expect(portraits.userPortraitsLoading.value).toBe(false);
  });

  it("does not handle a stale error or finish loading while a newer request is pending", async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();
    apiFetchJson
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const portraits = useUserPortraits({ id: "Genshin" });

    const firstPending = portraits.fetchUserPortraits("Amber");
    const secondPending = portraits.fetchUserPortraits("Lumine");
    firstRequest.reject(new Error("stale failure"));
    await firstPending;

    expect(handleApiError).not.toHaveBeenCalled();
    expect(portraits.userPortraits.value).toEqual([]);
    expect(portraits.userPortraitId.value).toBeNull();
    expect(portraits.userPortraitsLoading.value).toBe(true);

    secondRequest.resolve({ ok: true, data: [{ id: "lumine" }] });
    await secondPending;

    expect(portraits.userPortraits.value).toEqual([{ id: "lumine" }]);
    expect(portraits.userPortraitId.value).toBe("lumine");
    expect(portraits.userPortraitsLoading.value).toBe(false);
  });

  it("applies only the latest portrait config when responses resolve in reverse order", async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();
    apiFetchJson
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const portraits = useUserPortraits({ id: "Genshin" });

    const firstPending = portraits.fetchUserPortraitConfig("first");
    expect(portraits.userPortraitConfigFetching.value).toBe(true);
    expect(portraits.userPortraitConfigOffsetX.value).toBe(0);

    const secondPending = portraits.fetchUserPortraitConfig("second");
    expect(portraits.userPortraitId.value).toBe("second");
    expect(portraits.userPortraitConfigFetching.value).toBe(true);

    secondRequest.resolve({
      ok: true,
      data: {
        config: {
          offsetX: 20,
          offsetY: -4,
          targetScale: 1.25,
          flipX: true,
          artistAttribution: "artist",
        },
      },
    });
    await secondPending;

    expect(portraits.userPortraitConfigOffsetX.value).toBe(20);
    expect(portraits.userPortraitConfigOffsetY.value).toBe(-4);
    expect(portraits.userPortraitConfigTargetScale.value).toBe(1.25);
    expect(portraits.userPortraitConfigFlipX.value).toBe(true);
    expect(portraits.userPortraitConfigArtistAttribution.value).toBe("artist");
    expect(portraits.userPortraitConfigFetching.value).toBe(false);

    firstRequest.resolve({
      ok: true,
      data: { config: { offsetX: 99, offsetY: 99, targetScale: 2, flipX: false } },
    });
    await firstPending;

    expect(portraits.userPortraitId.value).toBe("second");
    expect(portraits.userPortraitConfigOffsetX.value).toBe(20);
    expect(portraits.userPortraitConfigOffsetY.value).toBe(-4);
    expect(portraits.userPortraitConfigTargetScale.value).toBe(1.25);
    expect(portraits.userPortraitConfigFlipX.value).toBe(true);
    expect(portraits.userPortraitConfigArtistAttribution.value).toBe("artist");
    expect(portraits.userPortraitConfigFetching.value).toBe(false);
  });

  it("ignores a stale portrait config error while the current request is pending", async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();
    apiFetchJson
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const portraits = useUserPortraits({ id: "Genshin" });

    const firstPending = portraits.fetchUserPortraitConfig("first");
    const secondPending = portraits.fetchUserPortraitConfig("second");

    firstRequest.reject(new Error("stale failure"));
    await firstPending;

    expect(handleApiError).not.toHaveBeenCalled();
    expect(portraits.userPortraitConfigFetching.value).toBe(true);
    expect(portraits.userPortraitConfigOffsetX.value).toBe(0);

    secondRequest.resolve({ ok: true, data: { config: { offsetX: 8 } } });
    await secondPending;

    expect(portraits.userPortraitConfigOffsetX.value).toBe(8);
    expect(portraits.userPortraitConfigFetching.value).toBe(false);
  });

  it("invalidates a pending config when the selected portrait is cleared", async () => {
    const request = deferred();
    apiFetchJson.mockReturnValue(request.promise);
    const portraits = useUserPortraits({ id: "Genshin" });

    const pending = portraits.fetchUserPortraitConfig("portrait");
    portraits.resetUserPortraitConfig();
    portraits.userPortraitId.value = null;

    expect(portraits.userPortraitConfigFetching.value).toBe(false);
    expect(portraits.userPortraitConfigOffsetX.value).toBe(0);

    request.resolve({ ok: true, data: { config: { offsetX: 42 } } });
    await pending;

    expect(portraits.userPortraitConfigOffsetX.value).toBe(0);
    expect(handleApiError).not.toHaveBeenCalled();
  });
});
