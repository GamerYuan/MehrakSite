<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useConfirm } from "primevue/useconfirm";
import EmptyState from "../components/ui/EmptyState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import StatusPill from "../components/ui/StatusPill.vue";
import SurfaceCard from "../components/ui/SurfaceCard.vue";
import { availablePermissions, permissionLabels } from "../configs/gameMeta";
import { normalizeUser } from "../composables/useAuth";
import { useApi } from "../composables/useApi";

defineProps({ userInfo: { type: Object, required: true } });
const confirm = useConfirm();
const { apiFetch, apiFetchJson, showErrorToast, showSuccessToast, showWarnToast, handleApiError } =
  useApi();
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref("");
const filterPermissions = ref([]);
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const selectedUser = ref(null);
const errorMsg = ref("");
const emptyPermissions = () =>
  Object.fromEntries(availablePermissions.map((permission) => [permission, false]));
const formData = ref({
  discordUserId: "",
  isSuperAdmin: false,
  isActive: true,
  permissions: emptyPermissions(),
});
const isRootUser = (user) => Boolean(user?.isRootUser);
const formatPermission = (permission) => permissionLabels[permission] || permission;

const fetchUsers = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const { ok, data, status } = await apiFetchJson("/users/list");
    if (ok) users.value = data.map(normalizeUser);
    else {
      errorMsg.value = "Failed to fetch users";
      showErrorToast(data.error || errorMsg.value, status);
    }
  } catch (error) {
    if (handleApiError(error)) return;
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const roleRank = (user) => {
  if (user.isRootUser) return 0;
  return user.isSuperAdmin ? 1 : 2;
};
const filteredUsers = computed(() =>
  users.value
    .filter((user) => {
      const matchesSearch = (user.discordUserId || "")
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      if (!filterPermissions.value.length) return matchesSearch;
      if (filterPermissions.value.includes("SuperAdmin")) return matchesSearch && user.isSuperAdmin;
      return (
        matchesSearch &&
        user.gameWritePermissions?.some((permission) =>
          filterPermissions.value.includes(permission),
        )
      );
    })
    .sort(
      (a, b) =>
        roleRank(a) - roleRank(b) ||
        String(a.discordUserId).localeCompare(String(b.discordUserId), undefined, {
          numeric: true,
        }),
    ),
);

const resetForm = () => {
  formData.value = {
    discordUserId: "",
    isSuperAdmin: false,
    isActive: true,
    permissions: emptyPermissions(),
  };
};
const openAddModal = () => {
  resetForm();
  showAddModal.value = true;
};
const blockRootAction = () => showWarnToast("Root users cannot be modified.");
const openUpdateModal = (user) => {
  if (isRootUser(user)) return blockRootAction();
  selectedUser.value = user;
  const granted = new Set(user.gameWritePermissions || []);
  formData.value = {
    discordUserId: user.discordUserId || "",
    isSuperAdmin: user.isSuperAdmin,
    isActive: user.isActive ?? true,
    permissions: Object.fromEntries(
      availablePermissions.map((permission) => [permission, granted.has(permission)]),
    ),
  };
  showUpdateModal.value = true;
};
const selectedPermissions = () =>
  Object.entries(formData.value.permissions)
    .filter(([, value]) => value)
    .map(([key]) => key);
const normalizedDiscordId = () => {
  try {
    return BigInt(formData.value.discordUserId).toString();
  } catch {
    showErrorToast("Discord ID must be a valid number");
    return null;
  }
};

const handleAddUser = async () => {
  const discordUserId = normalizedDiscordId();
  if (!discordUserId) return;
  saving.value = true;
  try {
    const response = await apiFetch("/users/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discordUserId,
        isSuperAdmin: formData.value.isSuperAdmin,
        gameWritePermissions: selectedPermissions(),
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to add user");
    }
    showAddModal.value = false;
    await fetchUsers();
    showSuccessToast("User added successfully");
  } catch (error) {
    handleApiError(error);
  } finally {
    saving.value = false;
  }
};

const handleUpdateUser = async () => {
  if (isRootUser(selectedUser.value)) return blockRootAction();
  const discordUserId = normalizedDiscordId();
  if (!discordUserId) return;
  saving.value = true;
  try {
    const response = await apiFetch(`/users/${selectedUser.value.discordUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discordUserId,
        isSuperAdmin: formData.value.isSuperAdmin,
        isActive: formData.value.isActive,
        gameWritePermissions: selectedPermissions(),
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update user");
    }
    showUpdateModal.value = false;
    await fetchUsers();
    showSuccessToast("User updated successfully");
  } catch (error) {
    handleApiError(error);
  } finally {
    saving.value = false;
  }
};

const handleDeleteUser = async (user) => {
  if (isRootUser(user)) return blockRootAction();
  try {
    const response = await apiFetch(`/users/${user.discordUserId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete user");
    }
    await fetchUsers();
    showSuccessToast("User deleted successfully");
  } catch (error) {
    handleApiError(error);
  }
};
const confirmDelete = (user) => {
  if (isRootUser(user)) return blockRootAction();
  confirm.require({
    message: `Are you sure you want to delete user ${user.discordUserId}?`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: () => handleDeleteUser(user),
  });
};
onMounted(fetchUsers);
</script>

<template>
  <div class="management-page">
    <PageHeader
      as="h1"
      eyebrow="Administration / Users"
      title="Access management"
      subtitle="Add administrators and assign game write permissions."
      icon="pi pi-users"
      class="management-header"
    >
      <template #actions>
        <Button label="Add user" icon="pi pi-plus" @click="openAddModal" />
      </template>
    </PageHeader>
    <Message v-if="errorMsg" severity="error" :closable="false">{{ errorMsg }}</Message>

    <SurfaceCard compact class="filter-panel" aria-labelledby="filters-title">
      <div class="panel-heading">
        <div>
          <h2 id="filters-title">Filters</h2>
        </div>
        <strong>{{ filteredUsers.length }} / {{ users.length }}</strong>
      </div>
      <div class="filters-row">
        <label class="search-field"
          ><span class="sr-only">Search by Discord ID</span
          ><i class="pi pi-search" aria-hidden="true"></i
          ><InputText v-model="searchQuery" placeholder="Search Discord ID" fluid
        /></label>
        <div class="filter-checkboxes" aria-label="Filter by permission">
          <div class="permission-item">
            <Checkbox
              :modelValue="!filterPermissions.length"
              binary
              inputId="filter-all"
              @update:modelValue="
                (value) => {
                  if (value) filterPermissions = [];
                }
              "
            /><label for="filter-all">All access</label>
          </div>
          <div class="permission-item">
            <Checkbox
              v-model="filterPermissions"
              value="SuperAdmin"
              inputId="filter-superadmin"
            /><label for="filter-superadmin">Super Admin</label>
          </div>
          <div v-for="permission in availablePermissions" :key="permission" class="permission-item">
            <Checkbox
              v-model="filterPermissions"
              :value="permission"
              :inputId="`filter-${permission}`"
            /><label :for="`filter-${permission}`">{{ formatPermission(permission) }}</label>
          </div>
        </div>
      </div>
    </SurfaceCard>

    <SurfaceCard compact class="table-panel" aria-labelledby="directory-title">
      <div class="panel-heading">
        <div>
          <h2 id="directory-title">User directory</h2>
        </div>
        <small>Root accounts are immutable</small>
      </div>
      <DataTable
        :value="filteredUsers"
        :loading="loading"
        responsiveLayout="scroll"
        size="small"
        class="management-table"
      >
        <template #empty>
          <EmptyState
            class="table-empty"
            icon="pi pi-users"
            title="No matching users"
            description="Adjust the search or permission filters."
          />
        </template>
        <Column field="discordUserId" header="Discord ID"
          ><template #body="{ data }"
            ><span class="mono-text">{{ data.discordUserId }}</span></template
          ></Column
        >
        <Column header="Role" style="width: 9rem"
          ><template #body="{ data }"
            ><StatusPill v-if="data.isRootUser" tone="danger" icon="pi pi-star-fill"
              >Root user</StatusPill
            ><StatusPill v-else-if="data.isSuperAdmin" tone="success" icon="pi pi-shield"
              >Super admin</StatusPill
            ><StatusPill v-else>User</StatusPill></template
          ></Column
        >
        <Column header="Game permissions"
          ><template #body="{ data }"
            ><div v-if="data.gameWritePermissions?.length" class="tag-list">
              <StatusPill
                v-for="permission in data.gameWritePermissions"
                :key="permission"
                tone="info"
                >{{ formatPermission(permission) }}</StatusPill
              >
            </div>
            <span v-else class="muted-text">No game permissions</span></template
          ></Column
        >
        <Column header="Actions" style="width: 7rem"
          ><template #body="{ data }"
            ><div class="row-actions">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                aria-label="Edit user"
                :disabled="data.isRootUser"
                @click="openUpdateModal(data)"
              /><Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                aria-label="Delete user"
                :disabled="data.isRootUser"
                @click="confirmDelete(data)"
              /></div></template
        ></Column>
      </DataTable>
    </SurfaceCard>

    <Dialog v-model:visible="showAddModal" modal header="Add user" :style="{ width: '28rem' }"
      ><form class="management-form" @submit.prevent="handleAddUser">
        <div class="field">
          <label for="discordId">Discord ID</label
          ><InputText
            id="discordId"
            v-model="formData.discordUserId"
            inputmode="numeric"
            autocomplete="off"
            required
            pattern="\d+"
            title="Numeric ID"
            fluid
          />
        </div>
        <div class="permission-item">
          <Checkbox v-model="formData.isSuperAdmin" binary inputId="isSuperAdmin" /><label
            for="isSuperAdmin"
            >Super Admin</label
          >
        </div>
        <fieldset>
          <legend>Game write permissions</legend>
          <div class="permission-grid">
            <div
              v-for="permission in availablePermissions"
              :key="permission"
              class="permission-item"
            >
              <Checkbox
                v-model="formData.permissions[permission]"
                binary
                :inputId="`add-perm-${permission}`"
              /><label :for="`add-perm-${permission}`">{{ formatPermission(permission) }}</label>
            </div>
          </div>
        </fieldset>
        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            @click="showAddModal = false"
          /><Button type="submit" label="Save user" :loading="saving" />
        </div></form
    ></Dialog>
    <Dialog v-model:visible="showUpdateModal" modal header="Update user" :style="{ width: '28rem' }"
      ><form class="management-form" @submit.prevent="handleUpdateUser">
        <div class="field">
          <label for="edit-discordId">Discord ID</label
          ><InputText
            id="edit-discordId"
            v-model="formData.discordUserId"
            inputmode="numeric"
            autocomplete="off"
            required
            pattern="\d+"
            title="Numeric ID"
            fluid
          />
        </div>
        <div class="permission-item">
          <Checkbox v-model="formData.isSuperAdmin" binary inputId="edit-isSuperAdmin" /><label
            for="edit-isSuperAdmin"
            >Super Admin</label
          >
        </div>
        <fieldset>
          <legend>Game write permissions</legend>
          <div class="permission-grid">
            <div
              v-for="permission in availablePermissions"
              :key="permission"
              class="permission-item"
            >
              <Checkbox
                v-model="formData.permissions[permission]"
                binary
                :inputId="`edit-perm-${permission}`"
              /><label :for="`edit-perm-${permission}`">{{ formatPermission(permission) }}</label>
            </div>
          </div>
        </fieldset>
        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            @click="showUpdateModal = false"
          /><Button type="submit" label="Save changes" :loading="saving" />
        </div></form
    ></Dialog>
  </div>
</template>

<style scoped>
.management-page {
  max-width: 86rem;
  margin: 0 auto;
}
.management-header {
  margin-bottom: var(--space-8);
}
.filter-panel,
.table-panel {
  padding: 0;
}
.filter-panel {
  margin-bottom: var(--space-4);
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface-sunken);
}
.panel-heading > div {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.panel-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
}
.panel-heading > strong,
.panel-heading small {
  color: var(--text-muted);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.filters-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}
.search-field {
  position: relative;
  display: block;
  max-width: 32rem;
}
.search-field i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: var(--space-3);
  color: var(--text-muted);
  transform: translateY(-50%);
}
.search-field :deep(input) {
  padding-left: 2.4rem;
}
.filter-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
}
.permission-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.permission-item label {
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--text-xs);
}
.table-panel {
  overflow: hidden;
}
.management-table :deep(th) {
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.management-table :deep(td) {
  border-color: var(--border-primary);
}
.mono-text {
  color: var(--text-primary);
  font-family: var(--font-mono);
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.muted-text {
  color: var(--text-muted);
  font-size: var(--text-xs);
}
.row-actions {
  display: flex;
  justify-content: flex-end;
}
.table-empty {
  min-height: 12rem;
  border: 0;
  border-radius: 0;
}
.management-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.field label,
fieldset legend {
  color: var(--text-primary);
  font-weight: 600;
}
fieldset {
  margin: 0;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}
fieldset legend {
  padding: 0 var(--space-2);
}
.permission-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-primary);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 640px) {
  .management-header :deep(.page-header-actions .p-button) {
    width: 100%;
  }
  .permission-grid {
    grid-template-columns: 1fr;
  }
  .panel-heading small {
    display: none;
  }
}
</style>
