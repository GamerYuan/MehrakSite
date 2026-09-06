import { createApp, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  api: {
    apiFetch: vi.fn(),
    apiFetchJson: vi.fn(),
    handleApiError: vi.fn(() => false),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showWarnToast: vi.fn(),
  },
  confirm: vi.fn(),
  emptyComponent: { render: () => null },
}));

vi.mock("../composables/useApi", () => ({
  useApi: () => ({
    ...testState.api,
    buildError: (message, status) => Object.assign(new Error(message), { status }),
  }),
}));

vi.mock("primevue/useconfirm", () => ({
  useConfirm: () => ({ require: testState.confirm }),
}));

vi.mock("primevue/button", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/checkbox", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/column", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/datatable", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/dialog", () => ({ default: testState.emptyComponent }));
vi.mock("primevue/inputtext", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/AdminActions.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/AdminCollectionState.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/EmptyState.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/PageHeader.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/StatusPill.vue", () => ({ default: testState.emptyComponent }));
vi.mock("../components/ui/SurfaceCard.vue", () => ({ default: testState.emptyComponent }));

import UserManagementView from "./UserManagementView.vue";

const response = (data = {}, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: vi.fn(async () => data),
});

const userList = [
  {
    DiscordUserId: "100000000000000001",
    IsSuperAdmin: false,
    IsRootUser: false,
    IsActive: false,
    GameWritePermissions: [],
  },
  {
    DiscordUserId: "100000000000000002",
    IsSuperAdmin: false,
    IsRootUser: false,
    GameWritePermissions: [],
  },
];

const flush = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

describe("UserManagementView account status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.api.apiFetchJson.mockResolvedValue({ ok: true, status: 200, data: userList });
    testState.api.apiFetch.mockResolvedValue(response());
  });

  it("keeps inactive and unknown status through mounted permission edits without sending activation", async () => {
    const host = document.createElement("div");
    const app = createApp(UserManagementView, { userInfo: { discordUserId: "9" } });
    app.mount(host);
    await flush();

    const state = app._instance.setupState;
    const inactive = state.users.find((user) => user.discordUserId === userList[0].DiscordUserId);
    const unknown = state.users.find((user) => user.discordUserId === userList[1].DiscordUserId);

    expect(inactive.isActive).toBe(false);
    expect(unknown.isActive).toBe(null);

    state.openUpdateModal(inactive);
    state.formData.permissions.Genshin = true;
    await state.handleUpdateUser();

    expect(JSON.parse(testState.api.apiFetch.mock.calls[0][1].body)).toEqual({
      discordUserId: inactive.discordUserId,
      isSuperAdmin: false,
      gameWritePermissions: ["Genshin"],
    });
    expect(JSON.parse(testState.api.apiFetch.mock.calls[0][1].body)).not.toHaveProperty("isActive");
    expect(state.users.find((user) => user.discordUserId === inactive.discordUserId).isActive).toBe(
      false,
    );

    testState.api.apiFetchJson.mockResolvedValueOnce({ ok: true, status: 200, data: userList });
    state.openUpdateModal(unknown);
    expect(state.formData.isActive).toBe(null);
    await state.handleUpdateUser();

    expect(JSON.parse(testState.api.apiFetch.mock.calls[1][1].body)).not.toHaveProperty("isActive");
    expect(state.users.find((user) => user.discordUserId === unknown.discordUserId).isActive).toBe(
      null,
    );
    app.unmount();
  });
});
