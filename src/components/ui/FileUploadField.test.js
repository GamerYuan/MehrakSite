import { createApp } from "vue";
import FileUploadField from "./FileUploadField.vue";

describe("FileUploadField", () => {
  it("emits the selected file and clears its status", async () => {
    const host = document.createElement("div");
    const selected = vi.fn();
    const component = createApp(FileUploadField, {
      label: "Portrait",
      accept: "image/png",
      onSelect: selected,
    }).mount(host);
    const input = host.querySelector('input[type="file"]');
    const file = new globalThis.File(["image"], "portrait.png", { type: "image/png" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });

    input.dispatchEvent(new globalThis.Event("change"));
    await component.$nextTick();

    expect(selected).toHaveBeenCalledWith(file);
    expect(host.textContent).toContain("portrait.png");

    component.clear();
    await component.$nextTick();
    expect(host.textContent).toContain("No file selected");
  });

  it("re-emits when the same file is picked again without an intervening clear", async () => {
    const host = document.createElement("div");
    const selected = vi.fn();
    const component = createApp(FileUploadField, {
      label: "Portrait",
      onSelect: selected,
    }).mount(host);
    const input = host.querySelector('input[type="file"]');
    const file = new globalThis.File(["image"], "portrait.png", { type: "image/png" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });

    input.dispatchEvent(new globalThis.Event("change"));
    await component.$nextTick();
    input.dispatchEvent(new globalThis.Event("change"));
    await component.$nextTick();

    expect(selected).toHaveBeenCalledTimes(2);
  });
});
