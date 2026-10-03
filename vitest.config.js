import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // Public root-relative URLs are browser paths, not module imports in DOM tests.
  plugins: [vue({ template: { transformAssetUrls: { includeAbsolute: false } } })],
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: false,
    exclude: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.opencode/worktrees/**"],
  },
});
