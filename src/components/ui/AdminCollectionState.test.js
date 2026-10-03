import { createApp, h } from "vue";
import AdminCollectionState from "./AdminCollectionState.vue";

const mountState = (props, slots = {}) => {
  const host = document.createElement("div");
  const app = createApp({ render: () => h(AdminCollectionState, props, slots) });
  app.mount(host);
  return { app, host };
};

describe("AdminCollectionState", () => {
  it("announces the initial busy state instead of rendering empty content", () => {
    const { app, host } = mountState({
      loading: true,
      empty: true,
      loadingLabel: "Loading users…",
    });

    expect(host.querySelector('[role="status"]').getAttribute("aria-busy")).toBe("true");
    expect(host.textContent).toContain("Loading users");
    expect(host.textContent).not.toContain("No records available");
    app.unmount();
  });

  it("renders a retryable error", () => {
    const retry = vi.fn();
    const { app, host } = mountState({ error: "Request failed", onRetry: retry });

    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    host.querySelector("button").click();
    expect(retry).toHaveBeenCalledTimes(1);
    app.unmount();
  });

  it("distinguishes filtered empty from true empty and exposes clear", () => {
    const clear = vi.fn();
    const { app, host } = mountState({ filtered: true, empty: true, onClear: clear });

    expect(host.textContent).toContain("No records match the active filters");
    host.querySelector("button").click();
    expect(clear).toHaveBeenCalledTimes(1);
    app.unmount();
  });

  it("retains record content when no collection state is active", () => {
    const { app, host } = mountState({}, { default: () => h("div", "Record content") });
    expect(host.textContent).toContain("Record content");
    app.unmount();
  });
});
