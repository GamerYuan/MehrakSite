<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import Sidebar from "../components/Sidebar.vue";

const router = useRouter();
const { user, loading, fetchUser } = useAuth();

onMounted(async () => {
  const u = await fetchUser();
  if (!u) {
    window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
  }
});
</script>

<template>
  <div class="dashboard-layout" v-if="!loading && user">
    <Sidebar :userInfo="user" />
    <main class="dashboard-content">
      <router-view :userInfo="user" :key="$route.path" />
    </main>
  </div>
  <div v-else-if="!loading && !user" class="dashboard-loading">
    <span>Redirecting to login...</span>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.dashboard-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  background-color: var(--bg-page);
  overflow-y: auto;
}

.dashboard-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--text-muted);
}
</style>
