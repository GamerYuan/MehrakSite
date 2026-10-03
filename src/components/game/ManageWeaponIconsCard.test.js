import { createApp, nextTick, reactive } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PrimeVue from "primevue/config";
import ManageWeaponIconsCard from "./ManageWeaponIconsCard.vue";
import { GAME_VIEW_KEY } from "../../composables/game/injectKey";

const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};

let app = null;
let host = null;

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  app?.unmount();
  host?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const mountSelector = async () => {
  const gv = reactive({
    filteredWeapons: Array.from({ length: 100 }, (_, index) => ({ id: 11_001 + index })),
    selectedWeaponId: null,
    weaponsLoading: false,
    selectedTypes: [],
    selectedRarities: [],
    showOnlyMissingAscended: false,
  });
  host = document.createElement("div");
  document.body.append(host);
  app = createApp(ManageWeaponIconsCard);
  app.use(PrimeVue);
  app.provide(GAME_VIEW_KEY, gv);
  app.mount(host);
  host.querySelector('[role="combobox"]').click();
  await flush();
  return gv;
};

describe("weapon selector navigation", () => {
  it("does not scroll a hovered option into view while browsing the list", async () => {
    const scrollIntoView = vi.fn();
    const original = globalThis.HTMLElement.prototype.scrollIntoView;
    globalThis.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    try {
      await mountSelector();
      scrollIntoView.mockClear();
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBe(100);
      options[50].dispatchEvent(new globalThis.MouseEvent("mousemove", { bubbles: true }));
      await flush();
      expect(scrollIntoView).not.toHaveBeenCalled();
    } finally {
      if (original) globalThis.HTMLElement.prototype.scrollIntoView = original;
      else delete globalThis.HTMLElement.prototype.scrollIntoView;
    }
  });

  it("still selects a weapon with the pointer without hover focus", async () => {
    const gv = await mountSelector();
    const option = document.querySelectorAll('[role="option"]').item(50);
    option.dispatchEvent(new globalThis.MouseEvent("mousemove", { bubbles: true }));
    option.dispatchEvent(new globalThis.MouseEvent("mousedown", { bubbles: true }));
    await flush();
    expect(gv.selectedWeaponId).toBe(11_051);
  });

  it("retains keyboard navigation, filtering, and weapon selection", async () => {
    const gv = await mountSelector();
    const filter = document.querySelector('[role="searchbox"]');
    expect(filter).not.toBeNull();
    filter.value = "11051";
    filter.dispatchEvent(new globalThis.Event("input", { bubbles: true }));
    await flush();
    expect(document.querySelectorAll('[role="option"]').length).toBe(1);
    filter.dispatchEvent(
      new globalThis.KeyboardEvent("keydown", {
        code: "ArrowDown",
        key: "ArrowDown",
        bubbles: true,
      }),
    );
    await flush();
    filter.dispatchEvent(
      new globalThis.KeyboardEvent("keydown", {
        code: "Enter",
        key: "Enter",
        bubbles: true,
      }),
    );
    await flush();
    expect(gv.selectedWeaponId).toBe(11_051);
  });
});
