<script setup>
import { onMounted } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";
import Tag from "primevue/tag";
import { gameLabels, permissionLabels } from "../configs/gameMeta";
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

const formatPermission = (permission) => permissionLabels[permission] || permission;
onMounted(fetchProfiles);
</script>

<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Station overview · Profile registry</p>
        <h1 class="page-title">Operator console</h1>
        <p class="page-subtitle">Maintain the HoYoLAB credentials used for card generation.</p>
      </div>
      <div v-if="user" class="access-summary" aria-label="Account access summary">
        <span
          ><strong>{{ profiles.length }}</strong> profiles</span
        >
        <span
          ><strong>{{ user.gameWritePermissions?.length || 0 }}</strong> game grants</span
        >
      </div>
    </header>

    <div v-if="loading" class="state-panel" role="status">
      <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
      <span>Reading operator record…</span>
    </div>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <template v-else-if="user">
      <section class="access-strip" aria-labelledby="access-title">
        <div>
          <p class="section-index">01 / ACCESS</p>
          <h2 id="access-title">Clearance record</h2>
          <p class="discord-id">Discord ID · {{ user.discordUserId }}</p>
        </div>
        <div class="access-tags">
          <Tag v-if="user.isRootUser" icon="pi pi-star-fill" value="Root" severity="warn" />
          <Tag
            v-if="user.isSuperAdmin"
            icon="pi pi-shield"
            value="Super Admin"
            severity="success"
          />
          <Tag
            v-for="permission in user.gameWritePermissions || []"
            :key="permission"
            icon="pi pi-key"
            :value="formatPermission(permission)"
            severity="info"
          />
          <span
            v-if="!user.isRootUser && !user.isSuperAdmin && !user.gameWritePermissions?.length"
            class="muted-text"
            >Standard command access</span
          >
        </div>
      </section>

      <section class="registry" aria-labelledby="profiles-title">
        <div class="section-header">
          <div>
            <p class="section-index">02 / CREDENTIAL VAULT</p>
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
          <span>Synchronizing profile registry…</span>
        </div>

        <div v-else-if="!profiles.length" class="empty-state">
          <span class="empty-orbit" aria-hidden="true"><i class="pi pi-user-plus"></i></span>
          <h3>No profiles in the registry</h3>
          <p>Add a HoYoLAB profile before generating account-linked cards.</p>
          <a href="/docs" target="_blank" rel="noopener noreferrer"
            >Open credential guide <i class="pi pi-arrow-up-right" aria-hidden="true"></i
          ></a>
        </div>

        <div v-else class="profile-grid">
          <article v-for="profile in profiles" :key="profile.profileId" class="profile-card">
            <header>
              <div>
                <span class="profile-number"
                  >PROFILE {{ String(profile.profileId).padStart(2, "0") }}</span
                >
                <h3>{{ profile.ltUid }}</h3>
                <span class="uid-label">HoYoLAB UID</span>
              </div>
              <div class="row-actions">
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
                  <Tag
                    v-if="profile.lastUsedRegions?.[game]"
                    :value="`Last used · ${profile.lastUsedRegions[game]}`"
                    severity="secondary"
                  />
                </div>
                <dl>
                  <div v-for="(uid, region) in regions" :key="region">
                    <dt>{{ region }}</dt>
                    <dd>{{ uid }}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </article>
        </div>
      </section>

      <Dialog
        v-model:visible="showAddModal"
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
                @click="showAddModal = false"
              /><Button type="submit" label="Register profile" :loading="profilesLoading" />
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        v-model:visible="showEditModal"
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
              @click="showEditModal = false"
            /><Button type="submit" label="Save credentials" :loading="profilesLoading" />
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
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}
.eyebrow,
.section-index {
  margin: 0 0 var(--space-2);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.page-title {
  font-size: clamp(2.25rem, 5vw, 4.25rem);
  font-weight: 500;
  line-height: var(--leading-tight);
}
.page-subtitle {
  max-width: 38rem;
  font-size: var(--text-base);
}
.access-summary {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-3) 0;
  border-block: 1px solid var(--border-primary);
  color: var(--text-muted);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.access-summary span {
  display: flex;
  flex-direction: column;
}
.access-summary strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  letter-spacing: 0;
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
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  border-left: 4px solid var(--brass);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
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
.empty-state {
  background: var(--bg-surface);
}
.empty-state h3 {
  margin: var(--space-3) 0 var(--space-1);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
}
.empty-state p {
  margin: 0 0 var(--space-3);
}
.empty-state a,
.form-actions a {
  color: var(--accent-strong);
  font-weight: 600;
  text-decoration: none;
}
.empty-orbit {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto;
  place-items: center;
  border: 1px solid var(--accent);
  border-radius: 50%;
  color: var(--accent);
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 25rem), 1fr));
  gap: var(--space-4);
}
.profile-card {
  position: relative;
  overflow: hidden;
  padding: var(--space-5);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--card-surface);
  box-shadow: var(--shadow-sm);
}
.profile-card::after {
  content: "";
  position: absolute;
  right: -2rem;
  bottom: -3rem;
  width: 8rem;
  height: 8rem;
  border: 1px solid rgba(var(--accent-rgb), 0.15);
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
.profile-number,
.uid-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
}
.profile-card h3 {
  margin: var(--space-1) 0 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
}
.row-actions {
  display: flex;
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
  border-left: 3px solid var(--brass);
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
@media (max-width: 700px) {
  .page-header,
  .section-header {
    align-items: stretch;
    flex-direction: column;
  }
  .access-summary {
    align-self: stretch;
    justify-content: space-around;
  }
  .access-strip {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  .access-tags {
    justify-content: flex-start;
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
