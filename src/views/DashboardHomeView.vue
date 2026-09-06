<script setup>
import { computed, onMounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";
import EmptyState from "../components/ui/EmptyState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import StatusPill from "../components/ui/StatusPill.vue";
import SurfaceCard from "../components/ui/SurfaceCard.vue";
import { gameLabels, gameMeta, permissionLabels } from "../configs/gameMeta";
import { useAuth } from "../composables/useAuth";
import { useProfileManagement } from "../composables/useProfileManagement";

const { user, loading, error } = useAuth();
const {
  profiles,
  loading: profilesLoading,
  addLoading,
  editLoading,
  showAddModal,
  showEditModal,
  selectedProfile,
  addForm,
  editForm,
  fetchProfiles,
  closeAddModal,
  closeEditModal,
  handleAddModalVisibility,
  handleEditModalVisibility,
  handleAddModalHide,
  handleEditModalHide,
  openAddModal,
  handleAdd,
  openEditModal,
  handleEdit,
  confirmDelete,
  confirmDeleteAll,
} = useProfileManagement();

const formatPermission = (permission) => permissionLabels[permission] || permission;
const hoyolabProfileUrl = (profile) =>
  `https://www.hoyolab.com/accountCenter/postList?id=${encodeURIComponent(profile.ltUid)}`;
const games = Object.values(gameMeta).filter(
  (game) => game.routeKey && game.capabilities?.commands,
);
const incompleteProfiles = computed(() =>
  profiles.value.filter((profile) => !Object.keys(profile.gameUids || {}).length),
);
const readyProfiles = computed(() => profiles.value.length - incompleteProfiles.value.length);
onMounted(fetchProfiles);
</script>

<template>
  <div class="dashboard-page">
    <PageHeader
      as="h1"
      eyebrow="Dashboard"
      title="Your dashboard"
      subtitle="Manage the HoYoLAB profiles used to generate game cards."
    />

    <div v-if="loading" class="state-panel" role="status">
      <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
      <span>Loading account...</span>
    </div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-else-if="user">
      <SurfaceCard
        v-if="user.isRootUser || user.isSuperAdmin || user.gameWritePermissions?.length"
        class="access-strip"
        aria-labelledby="access-title"
      >
        <div>
          <h2 id="access-title">Permissions</h2>
          <p class="discord-id">Discord ID: {{ user.discordUserId }}</p>
        </div>
        <div class="access-tags">
          <StatusPill v-if="user.isRootUser" icon="pi pi-star-fill" tone="warn">Root</StatusPill>
          <StatusPill v-if="user.isSuperAdmin" icon="pi pi-shield" tone="success">
            Super admin
          </StatusPill>
          <StatusPill
            v-for="permission in user.gameWritePermissions || []"
            :key="permission"
            icon="pi pi-key"
            tone="info"
          >
            {{ formatPermission(permission) }}
          </StatusPill>
        </div>
      </SurfaceCard>

      <section class="overview-grid" aria-label="Dashboard overview">
        <SurfaceCard class="overview-card games-overview">
          <div class="overview-heading">
            <div>
              <span class="surface-kicker">Games</span>
              <h2>Generate a card</h2>
            </div>
            <RouterLink to="/docs?tab=commands">Command reference</RouterLink>
          </div>
          <div class="game-links">
            <RouterLink
              v-for="game in games"
              :key="game.routeKey"
              :to="{ name: 'game', params: { game: game.routeKey } }"
              :style="game.gameColorStyle"
            >
              <img :src="game.logo" alt="" width="32" height="32" />
              <span>{{ game.label }}</span>
              <i class="pi pi-arrow-right" aria-hidden="true"></i>
            </RouterLink>
          </div>
        </SurfaceCard>

        <SurfaceCard class="overview-card readiness-card">
          <span class="surface-kicker">Profile readiness</span>
          <h2>{{ profilesLoading ? "Checking profiles" : `${readyProfiles} ready` }}</h2>
          <p v-if="profilesLoading">Loading the profile registry…</p>
          <p v-else-if="!profiles.length">
            Register a HoYoLAB profile to unlock account-linked cards.
          </p>
          <p v-else-if="incompleteProfiles.length">
            {{ incompleteProfiles.length }}
            {{ incompleteProfiles.length === 1 ? "profile needs" : "profiles need" }} a game UID.
          </p>
          <p v-else>Every registered profile has at least one game UID.</p>
          <button type="button" class="readiness-action" @click="openAddModal">
            {{ profiles.length ? "Add another profile" : "Add a profile" }}
          </button>
        </SurfaceCard>
      </section>

      <section class="registry" aria-labelledby="profiles-title">
        <div class="section-header">
          <div>
            <h2 id="profiles-title">HoYoLAB profiles</h2>
            <p>
              Credentials remain concealed and are only submitted when you create or update a
              profile.
            </p>
          </div>
          <div class="section-actions">
            <Button label="Add profile" icon="pi pi-plus" size="small" @click="openAddModal" />
            <Button
              v-if="profiles.length"
              label="Delete all"
              icon="pi pi-trash"
              size="small"
              severity="danger"
              outlined
              @click="confirmDeleteAll"
            />
          </div>
        </div>

        <div v-if="profilesLoading" class="state-panel" role="status">
          <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
          <span>Loading profiles...</span>
        </div>

        <EmptyState
          v-else-if="!profiles.length"
          icon="pi pi-user-plus"
          title="No profiles registered"
          description="Add a HoYoLAB profile before generating account-linked cards."
        >
          <a href="/docs" target="_blank" rel="noopener noreferrer"
            >Open profile guide <i class="pi pi-external-link" aria-hidden="true"></i
          ></a>
        </EmptyState>

        <div v-else class="profile-grid">
          <SurfaceCard
            v-for="profile in profiles"
            :key="profile.profileId"
            as="article"
            class="profile-card"
          >
            <header>
              <div>
                <span class="profile-number"
                  >PROFILE {{ String(profile.profileId).padStart(2, "0") }}</span
                >
                <h3>{{ profile.ltUid }}</h3>
              </div>
              <div class="row-actions">
                <a
                  class="profile-link"
                  :href="hoyolabProfileUrl(profile)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in HoYoLAB <i class="pi pi-external-link" aria-hidden="true"></i>
                </a>
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  text
                  rounded
                  aria-label="Edit profile"
                  @click="openEditModal(profile)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  text
                  rounded
                  severity="danger"
                  aria-label="Delete profile"
                  @click="confirmDelete(profile)"
                />
              </div>
            </header>

            <div v-if="!Object.keys(profile.gameUids || {}).length" class="no-uids">
              No game UIDs recorded
            </div>
            <div v-else class="game-records">
              <section v-for="(regions, game) in profile.gameUids" :key="game" class="game-record">
                <div class="game-record-title">
                  <strong>{{ gameLabels[game] || game }}</strong>
                  <StatusPill v-if="profile.lastUsedRegions?.[game]"
                    >Last used: {{ profile.lastUsedRegions[game] }}</StatusPill
                  >
                </div>
                <dl>
                  <div v-for="(uid, region) in regions" :key="region">
                    <dt>{{ region }}</dt>
                    <dd>{{ uid }}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <Dialog
        :visible="showAddModal"
        @update:visible="handleAddModalVisibility"
        @hide="handleAddModalHide"
        header="Register HoYoLAB profile"
        modal
        :style="{ width: '30rem' }"
      >
        <form class="profile-form" @submit.prevent="handleAdd">
          <p class="form-note">Sensitive values are never shown again after submission.</p>
          <div class="field">
            <label for="addLtUid">HoYoLAB UID</label>
            <InputText
              id="addLtUid"
              v-model="addForm.ltUid"
              inputmode="numeric"
              pattern="\d+"
              title="Numeric ID"
              placeholder="123456789"
              required
              fluid
            />
          </div>
          <div class="field">
            <label for="addLToken">LToken</label>
            <Password
              id="addLToken"
              v-model="addForm.lToken"
              toggleMask
              :feedback="false"
              required
              fluid
              inputClass="w-full"
            />
          </div>
          <div class="field">
            <label for="addPassphrase">Passphrase</label>
            <Password
              id="addPassphrase"
              v-model="addForm.passphrase"
              toggleMask
              :feedback="false"
              :maxlength="64"
              required
              fluid
              inputClass="w-full"
            />
          </div>
          <div class="form-actions">
            <a href="/docs" target="_blank" rel="noopener noreferrer">Credential help</a>
            <div>
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                outlined
                @click="closeAddModal"
              /><Button type="submit" label="Register profile" :loading="addLoading" />
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        :visible="showEditModal"
        @update:visible="handleEditModalVisibility"
        @hide="handleEditModalHide"
        header="Rotate profile credentials"
        modal
        :style="{ width: '30rem' }"
      >
        <form class="profile-form" @submit.prevent="handleEdit">
          <p class="form-note">
            Both sensitive values are replaced together. Existing values remain concealed.
          </p>
          <div class="field">
            <label>HoYoLAB UID</label>
            <div class="readonly-field">{{ selectedProfile?.ltUid }}</div>
          </div>
          <div class="field">
            <label for="editLToken">New LToken</label>
            <Password
              id="editLToken"
              v-model="editForm.lToken"
              toggleMask
              :feedback="false"
              required
              fluid
              inputClass="w-full"
            />
          </div>
          <div class="field">
            <label for="editPassphrase">New passphrase</label>
            <Password
              id="editPassphrase"
              v-model="editForm.passphrase"
              toggleMask
              :feedback="false"
              :maxlength="64"
              required
              fluid
              inputClass="w-full"
            />
          </div>
          <div class="form-actions end">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              @click="closeEditModal"
            /><Button type="submit" label="Save credentials" :loading="editLoading" />
          </div>
        </form>
      </Dialog>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 86rem;
  margin: 0 auto;
}
.dashboard-page > :deep(.page-header) {
  margin-bottom: var(--space-8);
}
.state-panel {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border: 1px dashed var(--border-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}
.access-strip {
  display: grid;
  grid-template-columns: minmax(15rem, 0.7fr) 1.3fr;
  gap: var(--space-8);
  align-items: center;
}
.access-strip h2,
.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 500;
}
.discord-id {
  margin: var(--space-2) 0 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.access-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
  margin-top: var(--space-6);
  gap: var(--space-4);
}

.overview-card h2 {
  margin: var(--space-2) 0 0;
  color: var(--text-primary);
  font-size: var(--text-xl);
}

.overview-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.overview-heading > a {
  display: inline-flex;
  min-height: var(--control-size);
  align-items: center;
  color: var(--accent-strong);
  font-weight: 650;
}

.game-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: var(--space-5);
  gap: var(--space-2);
}

.game-links a {
  display: grid;
  min-height: 4rem;
  padding: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--border-primary);
  background: color-mix(in oklch, var(--game-color) 14%, transparent);
  color: var(--text-primary);
  font-weight: 650;
  text-decoration: none;
}

.game-links img {
  border-radius: var(--radius-sm);
}

.readiness-card p {
  min-height: 3rem;
  margin: var(--space-3) 0 0;
  color: var(--text-secondary);
}

.readiness-action {
  min-height: var(--control-size);
  margin-top: var(--space-4);
  padding: 0 var(--space-4);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 650;
  cursor: pointer;
}

.registry {
  margin-top: var(--space-8);
}
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-5);
}
.section-header p:last-child {
  max-width: 42rem;
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
}
.section-actions,
.section-actions :deep(.p-button),
.form-actions > div {
  display: flex;
  gap: var(--space-2);
}
.registry :deep(.empty-state-panel) a,
.form-actions a {
  color: var(--accent-strong);
  font-weight: 600;
  text-decoration: none;
}
.registry :deep(.empty-state-panel) a {
  display: inline-flex;
  min-height: var(--control-size);
  align-items: center;
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 25rem), 1fr));
  gap: var(--space-4);
}
.profile-card {
  position: relative;
  overflow: hidden;
}
.profile-card::after {
  content: "";
  position: absolute;
  right: -2rem;
  bottom: -3rem;
  width: 8rem;
  height: 8rem;
  border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 50%;
  pointer-events: none;
}
.profile-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}
.profile-number {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
}
.profile-link {
  display: inline-flex;
  min-height: var(--control-size);
  padding: 0 var(--space-3);
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--accent-strong);
  font-size: var(--text-sm);
  font-weight: 650;
  text-decoration: none;
}
.profile-card h3 {
  margin: var(--space-1) 0 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
}
.row-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}
.game-records {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-4);
}
.game-record-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  color: var(--text-primary);
}
.game-record dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--space-2);
  margin: var(--space-2) 0 0;
}
.game-record dl div {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-raised);
}
.game-record dt {
  color: var(--text-muted);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.game-record dd {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.no-uids {
  padding: var(--space-6) 0 var(--space-2);
  color: var(--text-muted);
  font-style: italic;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-note {
  margin: 0;
  padding: var(--space-3);
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  font-size: var(--text-xs);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.field label {
  color: var(--text-primary);
  font-weight: 600;
}
.readonly-field {
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-sunken);
  color: var(--text-primary);
  font-family: var(--font-mono);
}
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-primary);
}
.form-actions.end {
  justify-content: flex-end;
}
.muted-text {
  color: var(--text-muted);
}
@media (max-width: 64rem) {
  .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 700px) {
  .section-header {
    align-items: stretch;
    flex-direction: column;
  }
  .access-strip {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  .access-tags {
    justify-content: flex-start;
  }
  .game-links {
    grid-template-columns: minmax(0, 1fr);
  }
  .section-actions,
  .section-actions :deep(.p-button) {
    width: 100%;
  }
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .form-actions > div {
    justify-content: flex-end;
  }
}
</style>
