import { createApp, nextTick, reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  emptyComponent: { render: () => null },
  gameView: null,
}));

vi.mock("../../composables/game/injectKey", () => ({
  useGameViewInject: () => testState.gameView,
}));

vi.mock("primevue/button", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      props: { label: String, type: { type: String, default: "button" } },
      setup(props, { attrs }) {
        return () =>
          h(
            "button",
            { ...attrs, type: props.type, "data-button-label": props.label },
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

vi.mock("primevue/message", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/password", () => ({ default: testState.emptyComponent }));

import AuthModal from "./AuthModal.vue";

const createGameView = () => {
  const gameView = reactive({
    showAuthModal: true,
    authProfileId: 7,
    authPassphrase: "secret",
    authLoading: false,
    authError: "",
    handleAuth: vi.fn(),
  });
  const clearAuthForm = vi.fn(() => {
    gameView.authPassphrase = "";
    gameView.authError = "";
  });
  const closeAuthModal = vi.fn(() => {
    gameView.showAuthModal = false;
    gameView.authLoading = false;
    clearAuthForm();
  });
  return Object.assign(gameView, { clearAuthForm, closeAuthModal });
};

describe("AuthModal credential dismissal", () => {
  beforeEach(() => {
    testState.gameView = createGameView();
  });

  it("clears the passphrase when Cancel, X, or Escape closes the mounted dialog", async () => {
    const host = document.createElement("div");
    const app = createApp(AuthModal);
    app.mount(host);

    const { gameView } = testState;
    const state = app._instance.setupState;
    host.querySelector('[data-button-label="Cancel"]').click();
    expect(gameView.closeAuthModal).toHaveBeenCalledTimes(1);
    expect(gameView.authPassphrase).toBe("");

    gameView.showAuthModal = true;
    gameView.authPassphrase = "x-secret";
    await nextTick();
    state.handleHide();
    expect(gameView.authPassphrase).toBe("x-secret");
    host.querySelector("[data-dialog-x]").click();
    expect(gameView.closeAuthModal).toHaveBeenCalledTimes(2);
    expect(gameView.authPassphrase).toBe("");

    gameView.showAuthModal = true;
    gameView.authPassphrase = "escape-secret";
    await nextTick();
    host.querySelector("[data-dialog-escape]").click();
    expect(gameView.closeAuthModal).toHaveBeenCalledTimes(3);
    expect(gameView.authPassphrase).toBe("");

    app.unmount();
  });
});
