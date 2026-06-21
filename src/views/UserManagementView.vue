<script setup>
import { ref, computed, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useApi } from "../composables/useApi";
import { availablePermissions, permissionLabels } from "../configs/gameMeta";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Message from "primevue/message";

const confirm = useConfirm();
const { apiFetch, apiFetchJson, showErrorToast, showSuccessToast, showWarnToast } = useApi();

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const users = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const filterPermission = ref("All");

const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showTempPasswordModal = ref(false);

const selectedUser = ref(null);
const tempPassword = ref("");
const error = ref("");

const isRootUser = (user) => !!user?.isRootUser;

const blockRootAction = () => {
  showWarnToast("Root users cannot be modified.");
};

const formatPermission = (str) => {
  if (!str) return "";
  return permissionLabels[str] || str;
};

const formData = ref({
  discordUserId: "",
  isSuperAdmin: false,
  isActive: true,
  permissions: Object.fromEntries(availablePermissions.map((p) => [p, false])),
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { ok, data, status } = await apiFetchJson("/users/list");
    if (ok) {
      users.value = data.map((u) => ({
        ...u,
        userId: u.userId || u.UserId || u.id || "",
        username: u.username || u.Username || "",
        discordUserId: u.discordUserId || u.DiscordUserId || "",
        isSuperAdmin: u.isSuperAdmin ?? u.IsSuperAdmin ?? false,
        isRootUser: u.isRootUser ?? u.IsRootUser ?? false,
        gameWritePermissions: u.gameWritePermissions || u.GameWritePermissions || [],
      }));
    } else {
      error.value = "Failed to fetch users";
      showErrorToast(data.error || "Failed to fetch users", status);
    }
  } catch (err) {
    if (err._redirected) return;
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch = (user.username || "")
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    if (filterPermission.value === "All") return matchesSearch;
    if (filterPermission.value === "SuperAdmin") return matchesSearch && user.isSuperAdmin;

    return (
      matchesSearch &&
      user.gameWritePermissions &&
      user.gameWritePermissions.includes(filterPermission.value)
    );
  });
});

const resetForm = () => {
  formData.value = {
    discordUserId: "",
    isSuperAdmin: false,
    isActive: true,
    permissions: Object.fromEntries(availablePermissions.map((p) => [p, false])),
  };
};

const openAddModal = () => {
  resetForm();
  showAddModal.value = true;
};

const openUpdateModal = (user) => {
  if (isRootUser(user)) {
    blockRootAction();
    return;
  }
  selectedUser.value = user;
  const userPerms = new Set((user.gameWritePermissions || []).map((p) => p.toLowerCase()));

  const newPermissions = {};
  availablePermissions.forEach((perm) => {
    newPermissions[perm] = userPerms.has(perm);
  });

  formData.value = {
    discordUserId: user.discordUserId || "",
    isSuperAdmin: user.isSuperAdmin,
    isActive: user.isActive ?? true,
    permissions: newPermissions,
  };
  showUpdateModal.value = true;
};

const confirmDelete = (user) => {
  if (isRootUser(user)) {
    blockRootAction();
    return;
  }
  confirm.require({
    message: `Are you sure you want to delete user ${user.username}?`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => handleDeleteUser(user),
  });
};

const getSelectedPermissions = () => {
  return Object.entries(formData.value.permissions)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);
};

const handleAddUser = async () => {
  try {
    let discordId;
    try {
      discordId = BigInt(formData.value.discordUserId).toString();
    } catch {
      showErrorToast("Discord ID must be a valid number");
      return;
    }

    const payload = {
      discordUserId: discordId,
      isSuperAdmin: formData.value.isSuperAdmin,
      gameWritePermissions: getSelectedPermissions(),
    };

    const response = await apiFetch("/users/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to add user");
    }

    const result = await response.json();
    tempPassword.value = result.temporaryPassword;
    showAddModal.value = false;
    showTempPasswordModal.value = true;
    fetchUsers();
    showSuccessToast("User added successfully");
  } catch (err) {
    if (err._redirected) return;
    showErrorToast(err.message, err.status);
  }
};

const handleUpdateUser = async () => {
  if (isRootUser(selectedUser.value)) {
    blockRootAction();
    return;
  }
  try {
    let discordId;
    try {
      discordId = BigInt(formData.value.discordUserId).toString();
    } catch {
      showErrorToast("Discord ID must be a valid number");
      return;
    }

    const payload = {
      discordUserId: discordId,
      isSuperAdmin: formData.value.isSuperAdmin,
      isActive: formData.value.isActive,
      gameWritePermissions: getSelectedPermissions(),
    };

    const response = await apiFetch(`/users/${selectedUser.value.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update user");
    }

    showUpdateModal.value = false;
    fetchUsers();
    showSuccessToast("User updated successfully");
  } catch (err) {
    if (err._redirected) return;
    showErrorToast(err.message, err.status);
  }
};

const handleDeleteUser = async (user) => {
  if (isRootUser(user)) {
    blockRootAction();
    return;
  }
  try {
    const response = await apiFetch(`/users/${user.userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete user");
    }

    fetchUsers();
    showSuccessToast("User deleted successfully");
  } catch (err) {
    if (err._redirected) return;
    showErrorToast(err.message, err.status);
  }
};

onMounted(() => {
  fetchUsers();
});

const permissionOptions = computed(() => {
  return [
    { label: "All Permissions", value: "All" },
    { label: "Super Admin", value: "SuperAdmin" },
    ...availablePermissions.map((perm) => ({
      label: formatPermission(perm),
      value: perm,
    })),
  ];
});
</script>

<template>
  <div class="management-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Invite users, set permissions, and manage access.</p>
      </div>
      <Button label="Add User" icon="pi pi-plus" @click="openAddModal" />
    </header>

    <Message v-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>

    <Card class="card-elevated filters-card">
      <template #content>
        <div class="filters-row">
          <InputText v-model="searchQuery" placeholder="Search users..." fluid />
          <Select
            v-model="filterPermission"
            :options="permissionOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter Permissions"
            class="permission-filter"
          />
        </div>
      </template>
    </Card>

    <Card class="card-elevated table-card">
      <template #content>
        <DataTable
          :value="filteredUsers"
          :loading="loading"
          responsiveLayout="scroll"
          class="user-table"
          size="small"
        >
          <Column field="discordUserId" header="Discord ID">
            <template #body="slotProps">
              <span class="mono-text">{{ slotProps.data.discordUserId }}</span>
            </template>
          </Column>
          <Column header="Role" style="width: 8rem">
            <template #body="slotProps">
              <Tag
                v-if="slotProps.data.isRootUser"
                severity="danger"
                icon="pi pi-star-fill"
                value="Root User"
              />
              <Tag
                v-else-if="slotProps.data.isSuperAdmin"
                severity="success"
                icon="pi pi-shield"
                value="Super Admin"
              />
              <Tag v-else severity="secondary" value="User" />
            </template>
          </Column>
          <Column header="Permissions">
            <template #body="slotProps">
              <div class="perm-tags">
                <Tag
                  v-for="perm in slotProps.data.gameWritePermissions"
                  :key="perm"
                  :value="formatPermission(perm)"
                  severity="info"
                />
              </div>
            </template>
          </Column>
          <Column header="Actions" style="width: 7rem">
            <template #body="slotProps">
              <div class="row-actions">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  text
                  rounded
                  aria-label="Edit"
                  :disabled="slotProps.data.isRootUser"
                  @click="openUpdateModal(slotProps.data)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  aria-label="Delete"
                  :disabled="slotProps.data.isRootUser"
                  @click="confirmDelete(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="showAddModal" modal header="Add New User" :style="{ width: '25rem' }">
      <form @submit.prevent="handleAddUser" class="user-form">
        <div class="field">
          <label for="discordId">Discord ID</label>
          <InputText
            id="discordId"
            v-model="formData.discordUserId"
            autocomplete="off"
            required
            pattern="\d+"
            title="Numeric ID"
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <div class="field checkbox-field">
          <Checkbox v-model="formData.isSuperAdmin" binary inputId="isSuperAdmin" />
          <label for="isSuperAdmin" class="checkbox-label">Super Admin</label>
        </div>

        <div class="field">
          <label>Game Write Permissions</label>
          <div class="permission-grid">
            <div v-for="perm in availablePermissions" :key="perm" class="permission-item">
              <Checkbox v-model="formData.permissions[perm]" binary :inputId="`add-perm-${perm}`" />
              <label :for="`add-perm-${perm}`" class="checkbox-label">{{ formatPermission(perm) }}</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" label="Cancel" severity="secondary" outlined @click="showAddModal = false" />
          <Button type="submit" label="Save" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="showUpdateModal" modal header="Update User" :style="{ width: '25rem' }">
      <form @submit.prevent="handleUpdateUser" class="user-form">
        <div class="field">
          <label for="edit-discordId">Discord ID</label>
          <InputText
            id="edit-discordId"
            v-model="formData.discordUserId"
            autocomplete="off"
            required
            pattern="\d+"
            title="Numeric ID"
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <div class="field checkbox-field">
          <Checkbox v-model="formData.isSuperAdmin" binary inputId="edit-isSuperAdmin" />
          <label for="edit-isSuperAdmin" class="checkbox-label">Super Admin</label>
        </div>

        <div class="field">
          <label>Game Write Permissions</label>
          <div class="permission-grid">
            <div v-for="perm in availablePermissions" :key="perm" class="permission-item">
              <Checkbox v-model="formData.permissions[perm]" binary :inputId="`edit-perm-${perm}`" />
              <label :for="`edit-perm-${perm}`" class="checkbox-label">{{ formatPermission(perm) }}</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" label="Cancel" severity="secondary" outlined @click="showUpdateModal = false" />
          <Button type="submit" label="Save" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="showTempPasswordModal" modal header="User Created" :style="{ width: '25rem' }">
      <div class="temp-password">
        <p class="mb-2">Temporary Password:</p>
        <div class="code-block select-all">
          {{ tempPassword }}
        </div>
        <p class="warning-text">Please copy this password. It will not be shown again.</p>
        <div class="flex justify-end">
          <Button label="Close" @click="showTempPasswordModal = false" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.management-page {
  max-width: 80rem;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.filters-card {
  margin-bottom: 1rem;
}

.filters-card :deep(.p-card-content) {
  padding: 1rem;
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .filters-row {
    flex-direction: row;
  }

  .permission-filter {
    width: 16rem;
    flex-shrink: 0;
  }
}

.table-card :deep(.p-card-content) {
  padding: 0;
  overflow-x: auto;
}

.user-table :deep(th) {
  background: var(--bg-surface-raised) !important;
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
}

.mono-text {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.font-medium {
  font-weight: 500;
  color: var(--text-primary);
}

.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.user-form .field {
  margin-bottom: 1.25rem;
}

.user-form label {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.checkbox-field,
.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-form .checkbox-field label,
.permission-item label {
  margin-bottom: 0;
}

.permission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.temp-password {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-block {
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.9375rem;
  word-break: break-all;
  color: var(--text-primary);
}

.warning-text {
  color: var(--p-orange-500);
  font-size: 0.875rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
