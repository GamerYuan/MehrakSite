<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import { useAuth } from "../composables/useAuth";

const route = useRoute();
const { user, loading } = useAuth();
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
const menuButton = ref(null);
const sidebar = ref(null);
const main = ref(null);

const closeSidebar = (restoreFocus = false) => {
  if (!sidebarOpen.value) return;
  sidebarOpen.value = false;
  if (restoreFocus) nextTick(() => menuButton.value?.focus());
};

const toggleSidebar = async () => {
  sidebarOpen.value = !sidebarOpen.value;
  if (sidebarOpen.value) {
    await nextTick();
    sidebar.value?.focusCloseButton();
  }
};

const handleKeydown = (event) => {
  if (event.key === "Escape") closeSidebar(true);
  if (event.key !== "Tab" || !sidebarOpen.value) return;

  const focusable = sidebar.value?.getFocusableElements() || [];
  if (!focusable.length) return;
  const [first] = focusable;
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

watch(
  () => route.path,
  async () => {
    closeSidebar();
    await nextTick();
    main.value?.focus();
  },
);
onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div
    v-if="!loading && user"
    class="dashboard-layout"
    :class="{ 'dashboard-layout--sidebar-collapsed': sidebarCollapsed }"
    :style="{ '--dashboard-sidebar-width': sidebarCollapsed ? '4.5rem' : '17.5rem' }"
  >
    <a class="skip-link" href="#dashboard-main">Skip to main content</a>
    <header class="mobile-topbar">
      <button
        ref="menuButton"
        class="menu-button"
        type="button"
        aria-label="Open dashboard navigation"
        aria-controls="dashboard-sidebar"
        :aria-expanded="sidebarOpen"
        @click="toggleSidebar"
      >
        <i class="pi pi-bars" aria-hidden="true"></i>
      </button>
      <a href="/" class="mobile-brand" aria-label="MehrakBot home">
        <img src="/logo.webp" alt="" />
        <span>MehrakBot</span>
      </a>
      <span class="mobile-context">Dashboard</span>
    </header>

    <Sidebar
      ref="sidebar"
      :userInfo="user"
      v-model="sidebarOpen"
      :collapsed="sidebarCollapsed"
      @update:collapsed="sidebarCollapsed = $event"
      @close="nextTick(() => menuButton.value?.focus())"
    />
    <main
      id="dashboard-main"
      ref="main"
      class="dashboard-content"
      :style="{ marginLeft: sidebarCollapsed ? '4.5rem' : '17.5rem' }"
      tabindex="-1"
    >
      <router-view :userInfo="user" :key="$route.path" />
    </main>
  </div>

  <div v-else class="dashboard-state" role="status" aria-live="polite">
    <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true"></i>
    <span>{{ loading ? "Loading dashboard..." : "Redirecting to login..." }}</span>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-page);
}

.mobile-topbar {
  display: none;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: var(--space-3);
  left: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--accent-strong);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
  transform: translateY(calc(-100% - var(--space-6)));
}

.skip-link:focus {
  transform: translateY(0);
}

.dashboard-content {
  min-height: 100vh;
  margin-left: var(--dashboard-sidebar-width);
  padding: var(--space-10) clamp(var(--space-5), 4vw, var(--space-12));
  transition: margin-left var(--motion-base) var(--ease-standard);
}

.dashboard-state {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

@media (max-width: 768px) {
  .mobile-topbar {
    position: sticky;
    z-index: 30;
    top: 0;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-3);
    min-height: 4rem;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--border-primary);
    background: var(--bg-overlay);
    backdrop-filter: blur(16px);
  }

  .menu-button {
    display: grid;
    width: var(--control-size);
    height: var(--control-size);
    place-items: center;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    cursor: pointer;
  }

  .mobile-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    width: fit-content;
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    text-decoration: none;
  }

  .mobile-brand img {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--radius-sm);
  }
  .mobile-context {
    color: var(--text-muted);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .dashboard-content {
    margin-left: 0;
    padding: var(--space-6) var(--space-4) var(--space-12);
  }
  .dashboard-layout--sidebar-collapsed .dashboard-content {
    margin-left: 0;
  }
}

@media (max-width: 420px) {
  .mobile-context {
    display: none;
  }
}
</style>
