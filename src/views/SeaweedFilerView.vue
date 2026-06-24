<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import { computed } from "vue";

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

const filerUrl = computed(() => {
  if (!backendUrl) return "";
  return `${backendUrl}/admin/seaweed-filer/`;
});

const openFiler = () => {
  if (!filerUrl.value) return;
  window.open(filerUrl.value, "_blank", "noopener,noreferrer");
};
</script>

<template>
  <div class="management-page space-y-6">
    <header class="page-header">
      <div>
        <h1 class="page-title">Seaweed Filer</h1>
        <p class="page-subtitle">
          Open the filer UI in a new tab through the authenticated dashboard proxy.
        </p>
      </div>
    </header>

    <div v-if="!userInfo.isSuperAdmin" class="warning-box">
      This page is only available to super admin users.
    </div>

    <Card v-else class="card-elevated">
      <template #content>
        <div class="flex flex-col gap-4">
          <p class="text-[var(--text-secondary)]">
            You are signed in as
            <strong class="text-[var(--text-primary)]">{{ userInfo.username }}</strong> with super
            admin access.
          </p>
          <Button
            icon="pi pi-external-link"
            label="Open Seaweed Filer UI"
            @click="openFiler"
            :disabled="!filerUrl"
          />
          <p v-if="!filerUrl" class="error-text">
            Backend URL is not configured. Set <code>VITE_APP_BACKEND_URL</code>.
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.management-page {
  max-width: 50rem;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 0.5rem;
}

.warning-box {
  border: 1px solid var(--p-orange-500);
  background: rgba(249, 115, 22, 0.1);
  color: var(--p-orange-500);
  border-radius: 0.75rem;
  padding: 1rem;
}

.error-text {
  color: var(--p-red-500);
  font-size: 0.875rem;
}

.error-text code {
  background: var(--bg-surface-raised);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
}
</style>
