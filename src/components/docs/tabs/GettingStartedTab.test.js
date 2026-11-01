import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import GettingStartedTab from "./GettingStartedTab.vue";

describe("Getting Started cookie instructions", () => {
  it("guides users to copy the token and UID separately from browser storage", () => {
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
      expect(text).toContain("Application");
      expect(text).toContain("Storage → Cookies");
      expect(text).toContain("Firefox");
      expect(text).toContain("ltoken_v2");
      expect(text).toContain("ltuid_v2");
      expect(text).toContain("copy only its Value as your token");
      expect(text).toContain("copy only its Value as your HoYoLAB UID");
      expect(text).toContain("ltuid_v2 into the HoYoLAB UID field");
      expect(text).toContain("ltoken_v2 into the LToken field");
      expect(text).toContain("the UID stays read-only");
      expect(text).not.toContain("HoYoLAB cookie string");
      expect(text).toContain("12–64 characters");
      expect(text).toContain("Keep both cookie values private");
      expect(text).not.toContain("Copy the full header value");
      expect(text).not.toContain("you do not enter them separately");
      expect(host.querySelector('img[src="/docs/getting-started/cookies.webp"]')).toBeNull();
      for (const browser of ["chromium", "firefox"]) {
        const screenshot = host.querySelector(`#${browser}-cookie-title + ol + figure img`);
        expect(screenshot).not.toBeNull();
        expect(screenshot.getAttribute("src")).toBe(
          `/docs/getting-started/cookies-${browser}-devtools.webp`,
        );
        expect(screenshot.getAttribute("alt")).toContain("HoYoLAB cookies table");
        expect(screenshot.getAttribute("loading")).toBe("lazy");
      }
    } finally {
      app.unmount();
    }
  });
});
