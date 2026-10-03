<script setup>
import { useAuth } from "../composables/useAuth";

const { logout, logoutStatus, logoutError } = useAuth();

const retryLogout = () => {
  void logout();
};
</script>

<template>
  <div v-if="logoutStatus === 'failed'" class="logout-status" role="alert">
    <div class="logout-status-content">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <span>{{ logoutError }}</span>
      <button type="button" class="logout-retry" @click="retryLogout">Try again</button>
    </div>
  </div>
</template>

<style scoped>
.logout-status {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1001;
  border-bottom: 1px solid var(--danger);
  background: var(--danger-soft);
}

.logout-status-content {
  display: flex;
  width: min(100% - 2rem, 90rem);
  margin: 0 auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  color: var(--danger);
  font-size: var(--text-sm);
}

.logout-status-content span {
  flex: 1;
}

.logout-retry {
  min-height: var(--control-size);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--danger);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.logout-retry:hover {
  background: var(--bg-surface-raised);
}

@media (max-width: 560px) {
  .logout-status-content {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .logout-status-content span {
    min-width: 0;
  }

  .logout-retry {
    margin-left: calc(1.25rem + var(--space-3));
  }
}
</style>
