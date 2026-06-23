<script setup>
import { availablePermissions, permissionLabels } from "../configs/gameMeta";
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { useApi } from "../composables/useApi";
import { useConfirm } from "primevue/useconfirm";

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
const filterPermissions = ref([]);

const showAddModal = ref(false);
const showUpdateModal = ref(false);

const selectedUser = ref(null);
const errorMsg = ref("");

const isRootUser = (user) => Boolean(user?.isRootUser);

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
        discordUserId: u.discordUserId || u.DiscordUserId || "",
        isSuperAdmin: u.isSuperAdmin ?? u.IsSuperAdmin ?? false,
        isRootUser: u.isRootUser ?? u.IsRootUser ?? false,
        gameWritePermissions: u.gameWritePermissions || u.GameWritePermissions || [],
      }));
    } else {
      errorMsg.value = "Failed to fetch users";
      showErrorToast(data.error || "Failed to fetch users", status);
    }
  } catch (error) {
    if (error._redirected) return;
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const getRole = (u) => {
  if (u.isRootUser) return 0;
  if (u.isSuperAdmin) return 1;
  return 2;
};

const filteredUsers = computed(() => 
  users.value
    .filter((user) => {
      const matchesSearch = (user.discordUserId || "")
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());

      if (filterPermissions.value.length === 0) return matchesSearch;
      if (filterPermissions.value.includes("SuperAdmin")) return matchesSearch && user.isSuperAdmin;

      return (
        matchesSearch &&
        user.gameWritePermissions &&
        user.gameWritePermissions.some((p) => filterPermissions.value.includes(p))
      );
    })
    .sort((a, b) => {
      const ra = getRole(a);
      const rb = getRole(b);
      if (ra !== rb) return ra - rb;
      return String(a.discordUserId).localeCompare(String(b.discordUserId), undefined, {
        numeric: true,
      });
    })
);

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
  const userPerms = new Set(user.gameWritePermissions || []);

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
    message: `Are you sure you want to delete user ${user.discordUserId}?`,
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

const getSelectedPermissions = () => 
  Object.entries(formData.value.permissions)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
;

const handleAddUser = async () => {
  try {
    let discordId = "";
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

    showAddModal.value = false;
    fetchUsers();
    showSuccessToast("User added successfully");
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

const handleUpdateUser = async () => {
  if (isRootUser(selectedUser.value)) {
    blockRootAction();
    return;
  }
  try {
    let discordId = "";
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

    const response = await apiFetch(`/users/${selectedUser.value.discordUserId}`, {
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
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

const handleDeleteUser = async (user) => {
  if (isRootUser(user)) {
    blockRootAction();
    return;
  }
  try {
    const response = await apiFetch(`/users/${user.discordUserId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete user");
    }

    fetchUsers();
    showSuccessToast("User deleted successfully");
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

onMounted(() => {
  fetchUsers();
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

    <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">{{ errorMsg }}</Message>

    <Card class="card-elevated filters-card">
      <template #content>
        <div class="filters-row">
          <InputText v-model="searchQuery" placeholder="Search users..." class="search-input" />
          <div class="filter-checkboxes">
            <div class="permission-item">
              <Checkbox
                :modelValue="filterPermissions.length === 0"
                binary
                inputId="filter-all"
                @update:modelValue="(v) => (filterPermissions = v ? [] : filterPermissions)"
              />
              <label for="filter-all" class="checkbox-label">All</label>
            </div>
            <div class="permission-item">
              <Checkbox
                v-model="filterPermissions"
                value="SuperAdmin"
                inputId="filter-superadmin"
              />
              <label for="filter-superadmin" class="checkbox-label">Super Admin</label>
            </div>
            <div v-for="perm in availablePermissions" :key="perm" class="permission-item">
              <Checkbox v-model="filterPermissions" :value="perm" :inputId="`filter-${perm}`" />
              <label :for="`filter-${perm}`" class="checkbox-label">{{
                formatPermission(perm)
              }}</label>
            </div>
          </div>
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
              <label :for="`add-perm-${perm}`" class="checkbox-label">{{
                formatPermission(perm)
              }}</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            @click="showAddModal = false"
          />
          <Button type="submit" label="Save" />
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showUpdateModal"
      modal
      header="Update User"
      :style="{ width: '25rem' }"
    >
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
              <Checkbox
                v-model="formData.permissions[perm]"
                binary
                :inputId="`edit-perm-${perm}`"
              />
              <label :for="`edit-perm-${perm}`" class="checkbox-label">{{
                formatPermission(perm)
              }}</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            @click="showUpdateModal = false"
          />
          <Button type="submit" label="Save" />
        </div>
      </form>
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

.search-input {
  flex: 1;
  min-width: 12rem;
}

.filter-checkboxes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
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
</style>
