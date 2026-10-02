import { parse } from "@vue/compiler-sfc";
import source from "./PublicLayout.vue?raw";

// JSDOM cannot hit-test dropdowns; guard the CSS boundary that caused the browser regression.
describe("PublicLayout stacking", () => {
  it("does not override the navbar's positioning and stacking layer", () => {
    const { descriptor } = parse(source);
    const css = descriptor.styles.map((style) => style.content).join("\n");

    expect(css).not.toMatch(/\.public-layout\s*>\s*\*/);
    expect(css).toMatch(
      /\.public-layout\s*>\s*main\s*,\s*\.public-layout\s*>\s*footer\s*\{\s*position:\s*relative;\s*z-index:\s*1;/,
    );
  });
});
