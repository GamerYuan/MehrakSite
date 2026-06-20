<script setup>
import { onMounted } from "vue";
import { useAuth } from "../composables/useAuth";
import { useProfileManagement } from "../composables/useProfileManagement";
import { gameConfigs } from "../configs/gameConfigs";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

const { user, loading, error } = useAuth();
const {
  profiles,
  loading: profilesLoading,
  showAddModal,
  showEditModal,
  selectedProfile,
  addForm,
  editForm,
  fetchProfiles,
  openAddModal,
  handleAdd,
  openEditModal,
  handleEdit,
  confirmDelete,
  confirmDeleteAll,
} = useProfileManagement();

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
};

const gameIdToTitle = Object.fromEntries(
  Object.values(gameConfigs).map((c) => [c.id, c.title]),
);

onMounted(() => {
  fetchProfiles();
});
</script>

<template>
  <div class="dashboard-container">
    <div v-if="loading" class="state-box">Loading user data...</div>
    <Message v-else-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>
    <div v-else-if="user">
      <header class="dashboard-header">
        <h1 class="page-title">Dashboard</h1>
      </header>

      <Card class="profile-card">
        <template #content>
          <div class="profile-row">
            <div class="profile-info">
              <img
                v-if="user.avatarUrl"
                :src="user.avatarUrl"
                :alt="user.username"
                class="profile-avatar"
              />
              <div>
                <div class="profile-name">{{ user.username }}</div>
                <div class="profile-id">Discord ID: {{ user.discordUserId }}</div>
              </div>
            </div>
          </div>

          <div v-if="user.isRootUser || user.isSuperAdmin" class="profile-fields">
            <div class="field-row">
              <span class="field-label">Root User</span>
              <Tag
                :severity="user.isRootUser ? 'warn' : 'secondary'"
                :value="user.isRootUser ? 'Yes' : 'No'"
              />
            </div>
            <div class="field-row">
              <span class="field-label">Super Admin</span>
              <Tag
                :severity="user.isSuperAdmin ? 'success' : 'secondary'"
                :value="user.isSuperAdmin ? 'Yes' : 'No'"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="user.gameWritePermissions?.length" class="perms-card">
        <template #content>
          <h3 class="card-title">Game Permissions</h3>
          <div class="perm-tags">
            <Tag
              v-for="perm in user.gameWritePermissions"
              :key="perm"
              :value="toTitleCase(perm)"
              severity="info"
            />
          </div>
        </template>
      </Card>

      <Card class="profiles-card">
        <template #content>
          <div class="profiles-header">
            <h3 class="card-title">Manage Profiles</h3>
            <div class="profiles-actions">
              <Button label="Add Profile" icon="pi pi-plus" size="small" @click="openAddModal" />
              <Button
                v-if="profiles.length"
                label="Delete All"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                outlined
                @click="confirmDeleteAll"
              />
            </div>
          </div>

          <div v-if="profilesLoading" class="profiles-loading">
            <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
          </div>

          <p v-else-if="!profiles.length" class="no-profiles">No profiles yet. Add one to get started.</p>

          <DataTable v-else :value="profiles" size="small" stripedRows>
            <Column header="Profile" style="width: 6rem">
              <template #body="{ data }">
                <Tag :value="`#${data.profileId}`" severity="secondary" />
              </template>
            </Column>
            <Column field="ltUid" header="HoYoLAB UID" style="width: 10rem">
              <template #body="{ data }">
                <span class="mono-text">{{ data.ltUid }}</span>
              </template>
            </Column>
            <Column header="Game">
              <template #body="{ data }">
                <div v-for="(regions, game) in data.gameUids" :key="game" class="game-uid-row">
                  <div class="game-uid-left">
                    <span class="game-uid-name">{{ gameIdToTitle[game] || game }}</span>
                    <Tag
                      v-if="data.lastUsedRegions?.[game]"
                      :value="`Last Used: ${data.lastUsedRegions[game]}`"
                      severity="secondary"
                      class="last-used-tag"
                    />
                  </div>
                </div>
                <span v-if="!Object.keys(data.gameUids || {}).length" class="muted-text">—</span>
              </template>
            </Column>
            <Column header="UIDs">
              <template #body="{ data }">
                <div v-for="(regions, game) in data.gameUids" :key="game" class="game-uid-row">
                  <table class="uid-table">
                    <tr v-for="(uid, region) in regions" :key="region">
                      <td class="uid-region">{{ region }}</td>
                      <td class="uid-value">{{ uid }}</td>
                    </tr>
                  </table>
                </div>
              </template>
            </Column>
            <Column header="" style="width: 9rem">
              <template #body="{ data }">
                <div class="row-actions">
                  <Button icon="pi pi-pencil" size="small" text rounded @click="openEditModal(data)" />
                  <Button icon="pi pi-trash" size="small" text rounded severity="danger" @click="confirmDelete(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Dialog v-model:visible="showAddModal" header="Add Profile" modal :style="{ width: '28rem' }">
        <form @submit.prevent="handleAdd" class="profile-form">
          <div class="field">
            <label for="addLtUid">HoYoLAB UID</label>
            <InputText id="addLtUid" v-model="addForm.ltUid" type="number" required class="w-full" />
          </div>
          <div class="field">
            <label for="addLToken">LToken</label>
            <InputText id="addLToken" v-model="addForm.lToken" required class="w-full" />
          </div>
          <div class="field">
            <label for="addPassphrase">Passphrase</label>
            <Password id="addPassphrase" v-model="addForm.passphrase" :feedback="false" :maxlength="64" required class="w-full" inputClass="w-full" />
          </div>
          <div class="form-actions">
            <Button type="button" label="Cancel" severity="secondary" outlined @click="showAddModal = false" />
            <Button type="submit" label="Add" :loading="profilesLoading" />
          </div>
        </form>
      </Dialog>

      <Dialog v-model:visible="showEditModal" header="Edit Profile" modal :style="{ width: '28rem' }">
        <form @submit.prevent="handleEdit" class="profile-form">
          <div class="field">
            <label>HoYoLAB UID</label>
            <div class="mono-text readonly-field">{{ selectedProfile?.ltUid }}</div>
          </div>
          <div class="field">
            <label for="editLToken">New LToken</label>
            <InputText id="editLToken" v-model="editForm.lToken" required class="w-full" />
          </div>
          <div class="field">
            <label for="editPassphrase">New Passphrase</label>
            <Password id="editPassphrase" v-model="editForm.passphrase" :feedback="false" :maxlength="64" required class="w-full" inputClass="w-full" />
          </div>
          <div class="form-actions">
            <Button type="button" label="Cancel" severity="secondary" outlined @click="showEditModal = false" />
            <Button type="submit" label="Save" :loading="profilesLoading" />
          </div>
        </form>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
}

.state-box {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}

.profile-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.75rem !important;
  margin-bottom: 1rem;
}

.profile-row {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-id {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

.perms-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.75rem !important;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profiles-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.75rem !important;
  margin-bottom: 1rem;
}

.profiles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.profiles-header .card-title {
  margin-bottom: 0;
}

.profiles-actions {
  display: flex;
  gap: 0.5rem;
}

.profiles-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.no-profiles {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.mono-text {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.muted-text {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.game-uid-row {
  padding: 0.375rem 0;
}

.game-uid-row + .game-uid-row {
  border-top: 1px solid var(--border-primary);
}

.game-uid-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 8rem;
}

.game-uid-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.last-used-tag {
  font-size: 0.6875rem !important;
  width: fit-content;
}

.uid-table {
  border-collapse: collapse;
}

.uid-table td {
  padding: 0.125rem 0.5rem;
  font-size: 0.8125rem;
}

.uid-region {
  color: var(--text-secondary);
  font-weight: 500;
}

.uid-value {
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-primary);
}

.row-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.profile-form .field {
  margin-bottom: 1.25rem;
}

.profile-form label {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.readonly-field {
  padding: 0.5rem 0.75rem;
  background: var(--bg-page);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .profiles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
