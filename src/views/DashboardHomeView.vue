<script setup>
import { useAuth } from "../composables/useAuth";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Message from "primevue/message";

const { user, loading, error } = useAuth();

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
};
</script>

<template>
  <div class="dashboard-container">
    <div v-if="loading" class="state-box">Loading user data...</div>
    <Message
      v-else-if="error"
      severity="error"
      :closable="false"
      class="mb-4"
      >{{ error }}</Message
    >
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
                <div class="profile-id">
                  Discord ID: {{ user.discordUserId }}
                </div>
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

.no-perms {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
