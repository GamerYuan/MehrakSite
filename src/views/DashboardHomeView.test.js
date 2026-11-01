import { createApp, nextTick } from "vue";
import PrimeVue from "primevue/config";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  api: {
    apiFetch: vi.fn(),
    apiFetchJson: vi.fn(),
    handleApiError: vi.fn(() => false),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
  },
  emptyComponent: { render: () => null },
}));

vi.mock("../composables/useApi", () => ({
  useApi: () => ({
    ...testState.api,
    buildError: (message, status) => Object.assign(new Error(message), { status }),
  }),
}));

vi.mock("../composables/useAuth", async () => {
  const { ref } = await import("vue");
  return {
    useAuth: () => ({
      user: ref({ discordUserId: "123", username: "test-user" }),
      loading: ref(false),
      error: ref(""),
    }),
  };
});

vi.mock("primevue/useconfirm", () => ({
  useConfirm: () => ({ require: vi.fn() }),
}));

vi.mock("primevue/button", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      props: {
        label: String,
        type: { type: String, default: "button" },
        disabled: Boolean,
        loading: Boolean,
      },
      setup(props, { attrs }) {
        return () =>
          h(
            "button",
            {
              ...attrs,
              type: props.type,
              disabled: props.disabled || props.loading,
              "data-button-label": props.label,
            },
            props.label,
          );
      },
    }),
  };
});

vi.mock("primevue/dialog", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      props: { visible: Boolean },
      emits: ["update:visible", "hide"],
      setup(props, { emit, slots }) {
        const dismiss = () => {
          emit("update:visible", false);
          emit("hide");
        };
        return () =>
          props.visible
            ? h("div", { class: "dialog-stub" }, [
                h("button", { type: "button", "data-dialog-x": true, onClick: dismiss }, "X"),
                h(
                  "button",
                  { type: "button", "data-dialog-escape": true, onClick: dismiss },
                  "Escape",
                ),
                slots.default?.(),
              ])
            : null;
      },
    }),
  };
});

// Use the real InputText to verify UID binding and native validation attributes.
vi.mock("primevue/message", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/progressspinner", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/EmptyState.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/PageHeader.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/StatusPill.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/SurfaceCard.vue", () => ({ default: testState.emptyComponent }));

import DashboardHomeView from "./DashboardHomeView.vue";

const flush = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

describe("DashboardHomeView credential dialog wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.api.apiFetchJson.mockResolvedValue({ ok: true, status: 200, data: [] });
  });

  it("clears add and edit credentials on Cancel, X, and Escape dismissal", async () => {
    const host = document.createElement("div");
    const app = createApp(DashboardHomeView);
    app.use(PrimeVue);
    app.component("RouterLink", testState.emptyComponent);
    app.mount(host);
    await flush();

    const state = app._instance.setupState;
    state.openAddModal();
    await flush();

    const uidInput = host.querySelector("#addLtUid");
    const tokenInput = host.querySelector("#addLToken");
    const passphraseInput = host.querySelector("#addPassphrase");
    expect(uidInput.required).toBe(true);
    expect(uidInput.inputMode).toBe("numeric");
    expect(uidInput.pattern).toBe(String.raw`\d+`);
    expect(tokenInput.type).toBe("password");
    expect(tokenInput.required).toBe(true);
    expect(tokenInput.autocomplete).toBe("off");
    expect(tokenInput.getAttribute("aria-describedby")).toBe("addTokenHelp");
    expect(host.querySelector("#addCookieString")).toBeNull();
    expect(passphraseInput.minLength).toBe(12);
    expect(passphraseInput.maxLength).toBe(64);
    expect(passphraseInput.required).toBe(true);
    expect(host.querySelector('label[for="addLtUid"]')).not.toBeNull();
    expect(host.querySelector('label[for="addLToken"]')).not.toBeNull();
    expect(
      host.querySelector('a[href="/docs?tab=getting-started#adding-a-profile"]'),
    ).not.toBeNull();
    uidInput.value = "123";
    uidInput.dispatchEvent(new globalThis.Event("input", { bubbles: true }));
    tokenInput.value = "example-token";
    tokenInput.dispatchEvent(new globalThis.Event("input", { bubbles: true }));
    await flush();
    expect(state.addForm.ltUid).toBe("123");
    expect(state.addForm.lToken).toBe("example-token");

    state.addForm = {
      ltUid: "123",
      lToken: "cancel-token",
      passphrase: "cancel-secret",
    };
    await flush();
    host.querySelector('[data-button-label="Cancel"]').click();
    expect(state.addForm).toEqual({ ltUid: "", lToken: "", passphrase: "" });

    state.openAddModal();
    state.addForm = { ltUid: "123", lToken: "x-token", passphrase: "x-secret" };
    await flush();
    host.querySelector("[data-dialog-x]").click();
    expect(state.addForm).toEqual({ ltUid: "", lToken: "", passphrase: "" });

    state.openEditModal({ profileId: 3, ltUid: 3 });
    state.editForm = { lToken: "escape-token", passphrase: "escape-secret" };
    await flush();
    expect(host.querySelector(".readonly-field").textContent).toBe("3");
    expect(host.querySelector("#addLtUid")).toBeNull();
    expect(state.editForm).toEqual({ lToken: "escape-token", passphrase: "escape-secret" });
    host.querySelector("[data-dialog-escape]").click();
    expect(state.editForm).toEqual({ lToken: "", passphrase: "" });
    expect(state.selectedProfile).toBeNull();

    app.unmount();
  });
});
