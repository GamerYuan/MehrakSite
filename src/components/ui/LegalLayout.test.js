import { createApp, h } from "vue";
import LegalLayout from "./LegalLayout.vue";

const sections = [
  { id: "first", label: "First section" },
  { id: "second", label: "Second section" },
];

describe("LegalLayout", () => {
  it("renders a collapsed native mobile contents control and matching anchors", () => {
    const host = document.createElement("div");
    const app = createApp({
      render: () =>
        h(
          LegalLayout,
          {
            eyebrow: "Legal",
            title: "Policy",
            summary: "Policy summary",
            filed: "Effective now",
            updated: "Today",
            sections,
          },
          {
            default: () => sections.map((section) => h("h2", { id: section.id }, section.label)),
          },
        ),
    });

    app.mount(host);

    const mobileContents = host.querySelector("details");
    expect(mobileContents.open).toBe(false);
    expect(mobileContents.querySelector("summary").textContent).toContain("On this page");
    expect(
      [...mobileContents.querySelectorAll("a")].map((link) => link.getAttribute("href")),
    ).toEqual(["#first", "#second"]);
    expect([...host.querySelectorAll("h2")].map((heading) => heading.id)).toEqual([
      "first",
      "second",
    ]);

    app.unmount();
  });
});
