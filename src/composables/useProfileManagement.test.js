import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  apiFetchJson: vi.fn(),
  buildError: vi.fn((message, status) => Object.assign(new Error(message), { status })),
  handleApiError: vi.fn(() => false),
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock("./useApi", () => ({
  useApi: () => api,
}));

const requireConfirmation = vi.hoisted(() => vi.fn());
vi.mock("primevue/useconfirm", () => ({
  useConfirm: () => ({ require: requireConfirmation }),
}));

import { useProfileManagement } from "./useProfileManagement";

const response = (data = {}, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: vi.fn(async () => data),
});

describe("useProfileManagement credential lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.apiFetchJson.mockResolvedValue({ ok: true, status: 200, data: [] });
  });

  it("clears the add form when a dialog visibility update dismisses it", () => {
    const management = useProfileManagement();
    management.openAddModal();
    management.addForm.value = { ltUid: "123", lToken: "token", passphrase: "secret" };

    management.handleAddModalVisibility(false);

    expect(management.showAddModal.value).toBe(false);
    expect(management.addForm.value).toEqual({ ltUid: "", lToken: "", passphrase: "" });
  });

  it("clears the edit form and selection on every edit dismissal path", () => {
    const management = useProfileManagement();
    management.openEditModal({ profileId: 4, ltUid: 123 });
    management.editForm.value = { lToken: "token", passphrase: "secret" };

    management.handleEditModalVisibility(false);

    expect(management.showEditModal.value).toBe(false);
    expect(management.selectedProfile.value).toBeNull();
    expect(management.editForm.value).toEqual({ lToken: "", passphrase: "" });
  });

  it("clears both credential fields after successful add and edit submissions", async () => {
    api.apiFetch.mockResolvedValue(response());
    const management = useProfileManagement();

    management.openAddModal();
    management.addForm.value = { ltUid: "123", lToken: "add-token", passphrase: "add-secret" };
    await management.handleAdd();

    expect(management.addForm.value).toEqual({ ltUid: "", lToken: "", passphrase: "" });
    expect(management.showAddModal.value).toBe(false);

    management.openEditModal({ profileId: 4, ltUid: 123 });
    management.editForm.value = { lToken: "edit-token", passphrase: "edit-secret" };
    await management.handleEdit();

    expect(management.editForm.value).toEqual({ lToken: "", passphrase: "" });
    expect(management.showEditModal.value).toBe(false);
    expect(management.selectedProfile.value).toBeNull();
  });

  it("keeps credentials available for an ordinary retry after a failed submission", async () => {
    api.apiFetch.mockResolvedValue(
      response({ error: "Invalid credentials" }, { ok: false, status: 400 }),
    );
    const management = useProfileManagement();
    management.openAddModal();
    management.addForm.value = { ltUid: "123", lToken: "retry-token", passphrase: "retry-secret" };

    await management.handleAdd();

    expect(management.showAddModal.value).toBe(true);
    expect(management.addForm.value).toEqual({
      ltUid: "123",
      lToken: "retry-token",
      passphrase: "retry-secret",
    });
    expect(api.handleApiError).toHaveBeenCalledTimes(1);
  });

  it("ignores a late add response after the dialog was dismissed", async () => {
    let resolveRequest = null;
    api.apiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const management = useProfileManagement();
    management.openAddModal();
    management.addForm.value = { ltUid: "123", lToken: "token", passphrase: "secret" };

    const request = management.handleAdd();
    management.closeAddModal();
    resolveRequest(response());
    await request;

    expect(management.showAddModal.value).toBe(false);
    expect(management.addForm.value).toEqual({ ltUid: "", lToken: "", passphrase: "" });
    expect(api.apiFetchJson).toHaveBeenCalledWith("/profiles");
    expect(api.showSuccessToast).not.toHaveBeenCalled();
  });

  it("ignores a late edit response after the dialog was dismissed", async () => {
    let resolveRequest = null;
    api.apiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const management = useProfileManagement();
    management.openEditModal({ profileId: 4, ltUid: 123 });
    management.editForm.value = { lToken: "token", passphrase: "secret" };

    const request = management.handleEdit();
    management.closeEditModal();
    resolveRequest(response());
    await request;

    expect(management.showEditModal.value).toBe(false);
    expect(management.editForm.value).toEqual({ lToken: "", passphrase: "" });
    expect(management.selectedProfile.value).toBeNull();
    expect(api.apiFetchJson).toHaveBeenCalledWith("/profiles");
    expect(api.showSuccessToast).not.toHaveBeenCalled();
  });
});
