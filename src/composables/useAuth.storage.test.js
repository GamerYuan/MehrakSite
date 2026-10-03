import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  buildError: vi.fn((message, status) => Object.assign(new Error(message), { status })),
  standaloneApiFetch: vi.fn(),
  standaloneApiFetchJson: vi.fn(),
}));

vi.mock("./useApi", () => api);

describe("useAuth storage resilience", () => {
  it("does not fail module initialization when session storage access is denied", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("Storage access denied");
      },
    });

    try {
      vi.resetModules();
      const module = await import("./useAuth");
      expect(module.normalizeUser({ discordId: "123" }).isActive).toBe(null);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "sessionStorage", originalDescriptor);
      } else {
        delete globalThis.sessionStorage;
      }
    }
  });

  it("does not fail module initialization when reading the marker is denied", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("Storage read denied");
        },
        removeItem() {},
        setItem() {},
      },
    });

    try {
      vi.resetModules();
      const module = await import("./useAuth");
      expect(module.normalizeUser({ discordId: "123" }).isActive).toBe(null);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "sessionStorage", originalDescriptor);
      } else {
        delete globalThis.sessionStorage;
      }
    }
  });
});
