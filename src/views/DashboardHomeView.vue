<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";
import Tag from "primevue/tag";
import { gameLabels } from "../configs/gameMeta";
import { useAuth } from "../composables/useAuth";
import { useProfileManagement } from "../composables/useProfileManagement";

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

const isMobile = ref(false);

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
};

const checkViewport = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  fetchProfiles();
  checkViewport();
  window.addEventListener("resize", checkViewport);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkViewport);
});
</script>

<template>
  <div class="dashboard-container">
    <div v-if="loading" class="state-box">Loading user data...</div>
    <Message v-else-if="error" severity="error" :closable="false" class="mb-4">{{ error }}</Message>

    <div v-else-if="user" class="space-y-6">
      <header class="dashboard-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Manage your MehrakBot profiles and game commands.</p>
      </header>

      <Card class="dashboard-card profile-panel">
        <template #content>
          <div class="profile-identity">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="user.username"
              class="profile-avatar"
            />
            <div class="profile-details">
              <div class="profile-name">{{ user.username }}</div>
              <div class="profile-id">Discord ID: {{ user.discordUserId }}</div>
            </div>
          </div>

          <div class="profile-badges">
            <Tag v-if="user.isRootUser" icon="pi pi-star-fill" value="Root" severity="warn" />
            <Tag
              v-if="user.isSuperAdmin"
              icon="pi pi-shield"
              value="Super Admin"
              severity="success"
            />
            <Tag
              v-for="perm in user.gameWritePermissions || []"
              :key="perm"
              icon="pi pi-pen-to-square"
              :value="toTitleCase(perm)"
              severity="info"
            />
          </div>
        </template>
      </Card>

      <Card class="dashboard-card profiles-panel">
        <template #content>
          <div class="profiles-header">
            <div>
              <h3 class="card-title">Manage Profiles</h3>
              <p class="card-subtitle">Profiles link your HoYoLAB account to generated images.</p>
            </div>
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

          <div v-else-if="!profiles.length" class="empty-state">
            <i class="pi pi-user-plus empty-icon"></i>
            <p>No profiles yet. Add one to get started.</p>
            <a href="/#/docs" target="_blank" rel="noopener noreferrer" class="docs-link"
              >Read the docs</a
            >
          </div>

          <DataTable
            v-else-if="!isMobile"
            :value="profiles"
            size="small"
            stripedRows
            responsiveLayout="scroll"
            class="profiles-table"
          >
            <Column header="Profile" style="width: 6rem">
              <template #body="{ data }">
                <Tag :value="`#${data.profileId}`" severity="secondary" />
              </template>
            </Column>
            <Column field="ltUid" header="HoYoLAB UID" style="width: 11rem">
              <template #body="{ data }">
                <span class="mono-text">{{ data.ltUid }}</span>
              </template>
            </Column>
            <Column header="Game UIDs">
              <template #body="{ data }">
                <div v-if="!Object.keys(data.gameUids || {}).length" class="muted-text">—</div>
                <div v-else class="game-uids-stack">
                  <div v-for="(regions, game) in data.gameUids" :key="game" class="game-uid-block">
                    <div class="game-uid-header">
                      <span class="game-uid-name">{{ gameLabels[game] || game }}</span>
                      <Tag
                        v-if="data.lastUsedRegions?.[game]"
                        :value="`Last Used: ${data.lastUsedRegions[game]}`"
                        severity="secondary"
                        class="last-used-tag"
                      />
                    </div>
                    <div class="uid-rows">
                      <div v-for="(uid, region) in regions" :key="region" class="uid-row">
                        <span class="uid-region">{{ region }}</span>
                        <span class="uid-value">{{ uid }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Column>
            <Column header="" style="width: 7rem">
              <template #body="{ data }">
                <div class="row-actions">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    rounded
                    @click="openEditModal(data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    rounded
                    severity="danger"
                    @click="confirmDelete(data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>

          <div v-else class="profile-cards">
            <Card v-for="profile in profiles" :key="profile.profileId" class="profile-card-mobile">
              <template #content>
                <div class="profile-card-top">
                  <div class="profile-card-meta">
                    <Tag :value="`#${profile.profileId}`" severity="secondary" />
                    <span class="mono-text">{{ profile.ltUid }}</span>
                  </div>
                  <div class="row-actions">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      text
                      rounded
                      @click="openEditModal(profile)"
                    />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      text
                      rounded
                      severity="danger"
                      @click="confirmDelete(profile)"
                    />
                  </div>
                </div>
                <div class="profile-card-uids">
                  <div v-if="!Object.keys(profile.gameUids || {}).length" class="muted-text">
                    No game UIDs
                  </div>
                  <div
                    v-for="(regions, game) in profile.gameUids"
                    :key="game"
                    class="game-uid-block"
                  >
                    <div class="game-uid-header">
                      <span class="game-uid-name">{{ gameLabels[game] || game }}</span>
                      <Tag
                        v-if="profile.lastUsedRegions?.[game]"
                        :value="profile.lastUsedRegions[game]"
                        severity="secondary"
                        class="last-used-tag"
                      />
                    </div>
                    <div class="uid-rows">
                      <div v-for="(uid, region) in regions" :key="region" class="uid-row">
                        <span class="uid-region">{{ region }}</span>
                        <span class="uid-value">{{ uid }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </template>
      </Card>

      <Dialog v-model:visible="showAddModal" header="Add Profile" modal :style="{ width: '28rem' }">
        <form @submit.prevent="handleAdd" class="profile-form">
          <div class="field">
            <label for="addLtUid">HoYoLAB UID</label>
            <InputText
              id="addLtUid"
              v-model="addForm.ltUid"
              type="text"
              inputmode="numeric"
              pattern="\d+"
              title="Numeric ID"
              placeholder="e.g. 123456789"
              required
              class="w-full"
            />
          </div>
          <div class="field">
            <label for="addLToken">LToken</label>
            <InputText id="addLToken" v-model="addForm.lToken" required class="w-full" />
          </div>
          <div class="field">
            <label for="addPassphrase">Passphrase</label>
            <Password
              id="addPassphrase"
              toggleMask
              v-model="addForm.passphrase"
              :feedback="false"
              :maxlength="64"
              required
              class="w-full"
              inputClass="w-full"
            />
          </div>
          <div class="form-actions">
            <a href="/#/docs" target="_blank" class="docs-link">Need help? Read the docs</a>
            <div class="flex gap-2">
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                outlined
                @click="showAddModal = false"
              />
              <Button type="submit" label="Add" :loading="profilesLoading" />
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        v-model:visible="showEditModal"
        header="Edit Profile"
        modal
        :style="{ width: '28rem' }"
      >
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
            <Password
              id="editPassphrase"
              v-model="editForm.passphrase"
              :feedback="false"
              :maxlength="64"
              required
              class="w-full"
              inputClass="w-full"
            />
          </div>
          <div class="form-actions">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              @click="showEditModal = false"
            />
            <Button type="submit" label="Save" :loading="profilesLoading" />
          </div>
        </form>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 80rem;
  margin: 0 auto;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.state-box {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.dashboard-header {
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.dashboard-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.875rem !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
}

.dark .dashboard-card {
  box-shadow: none !important;
}

.profile-panel :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  gap: 1rem;
}

.profile-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
}

.profile-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-id {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, monospace;
  margin-top: 0.125rem;
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
}

.profiles-panel :deep(.p-card-content) {
  padding: 1.25rem;
}

.profiles-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .profiles-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.profiles-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.profiles-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  border: 1px dashed var(--border-secondary);
  border-radius: 0.75rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
  color: var(--text-secondary);
}

.docs-link {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--p-primary-color);
  text-decoration: none;
}

.docs-link:hover {
  text-decoration: underline;
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

.profiles-table :deep(th) {
  background: var(--bg-surface-raised) !important;
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
}

.game-uids-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-uid-block {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.game-uid-block + .game-uid-block {
  border-top: 1px solid var(--border-primary);
  padding-top: 0.75rem;
}

.game-uid-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.game-uid-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.last-used-tag {
  font-size: 0.6875rem !important;
}

.uid-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.uid-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.uid-region {
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  line-height: 1;
}

.uid-value {
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-primary);
  line-height: 1;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.profile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-card-mobile {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.75rem !important;
}

.profile-card-mobile :deep(.p-card-content) {
  padding: 1rem;
}

.profile-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.profile-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.profile-card-uids {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-card-uids .game-uid-block + .game-uid-block {
  border-top: 1px solid var(--border-primary);
  padding-top: 0.75rem;
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
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (min-width: 640px) {
  .form-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
