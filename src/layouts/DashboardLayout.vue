<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import Sidebar from "../components/Sidebar.vue";

const router = useRouter();
const { user, loading, fetchUser } = useAuth();

const sidebarOpen = ref(false);
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

onMounted(async () => {
  const u = await fetchUser();
  if (!u) {
    window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
  }
});
</script>

<template>
  <div class="dashboard-layout" v-if="!loading && user">
    <header class="mobile-topbar">
      <button class="hamburger-btn" @click="toggleSidebar" aria-label="Toggle menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <span class="mobile-topbar-title">MehrakBot</span>
    </header>

    <Sidebar :userInfo="user" v-model="sidebarOpen" />
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

.mobile-topbar {
  display: none;
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

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: var(--bg-surface);
    border-bottom: 1px solid var(--border-primary);
    position: sticky;
    top: 0;
    z-index: 997;
    width: 100%;
  }

  .mobile-topbar-title {
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--accent);
  }

  .hamburger-btn {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .hamburger-line {
    display: block;
    width: 22px;
    height: 2px;
    background-color: var(--text-primary);
    border-radius: 2px;
  }

  .dashboard-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
