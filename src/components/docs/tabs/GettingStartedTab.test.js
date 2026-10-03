import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import GettingStartedTab from "./GettingStartedTab.vue";

describe("Getting Started cookie instructions", () => {
  it("guides users to copy the full request cookie string rather than a single token", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/:pathMatch(.*)*", component: { render: () => null } }],
    });
    const host = document.createElement("div");
    const app = createApp(GettingStartedTab);
    app.use(router);
    app.mount(host);

    try {
      const text = host.textContent.replace(/\s+/g, " ");
      expect(text).toContain("Network");
      expect(text).toContain("reload the HoYoLAB tab");
      expect(text).toContain("Headers → Request Headers");
      expect(text).toContain("Copy the full header value");
      expect(text).toContain("12–64 characters");
      expect(text).toContain("Keep the cookie string private");
      expect(text).not.toContain("ltoken_v2");
      const screenshot = host.querySelector('img[src="/docs/getting-started/cookies.webp"]');
      expect(screenshot).not.toBeNull();
      expect(screenshot.getAttribute("alt")).toContain("cookie values are obscured");
      expect(screenshot.getAttribute("width")).toBe("2074");
      expect(screenshot.getAttribute("height")).toBe("648");
      expect(screenshot.getAttribute("loading")).toBe("lazy");
      expect(text).toContain("including all wrapped lines");
      expect(host.querySelector('img[src*="cookies-chromium-devtools"]')).toBeNull();
      expect(host.querySelector('img[src*="cookies-firefox-devtools"]')).toBeNull();
    } finally {
      app.unmount();
    }
  });
});
