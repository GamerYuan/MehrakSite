<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import ThemeToggle from "./ThemeToggle.vue";
import { gameMeta, hasAnyGamePermission, isSuperAdminUser } from "../configs/gameMeta";
import { isDashboardDestinationActive, resolveActiveGameKey } from "../configs/dashboardNavigation";
import { useAuth } from "../composables/useAuth";

const route = useRoute();
const { logout, logoutStatus } = useAuth();
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
const closeButton = ref(null);
const isMobile = ref(false);
let mediaQuery = null;
const updateMobile = () => (isMobile.value = mediaQuery.matches);

const props = defineProps({
  userInfo: { type: Object, required: true },
  modelValue: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "update:collapsed", "close"]);

const games = Object.values(gameMeta).filter(
  (game) => game.routeKey && game.capabilities?.commands,
);

const isSuperAdmin = computed(() => isSuperAdminUser(props.userInfo));
const hasGlobalManagement = computed(() => hasAnyGamePermission(props.userInfo));
const validGameKeys = new Set(games.map((game) => game.routeKey));
const activeGameKey = computed(() => resolveActiveGameKey(route, validGameKeys));

const close = (restoreFocus = false) => {
  const wasOpen = props.modelValue;
  emit("update:modelValue", false);
  if (restoreFocus && wasOpen) emit("close");
};
const isActive = (name) => isDashboardDestinationActive(route, name);
const isGameActive = (routeKey) => activeGameKey.value === routeKey;
const toggleCollapsed = () => emit("update:collapsed", !props.collapsed);
const handleLogout = () => {
  void logout();
};
const focusCloseButton = () => closeButton.value?.focus();
const getFocusableElements = () =>
  [
    closeButton.value,
    ...document.querySelectorAll(
      "#dashboard-sidebar a[href], #dashboard-sidebar button:not([disabled]), #dashboard-sidebar summary",
    ),
  ].filter((element) => element && globalThis.getComputedStyle(element).display !== "none");
defineExpose({ focusCloseButton, getFocusableElements });

onMounted(() => {
  mediaQuery = globalThis.matchMedia("(max-width: 768px)");
  updateMobile();
  mediaQuery.addEventListener("change", updateMobile);
});
onUnmounted(() => mediaQuery?.removeEventListener("change", updateMobile));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <button
        v-if="modelValue"
        class="sidebar-backdrop"
        type="button"
        aria-label="Close dashboard navigation"
        @click="close(true)"
      ></button>
    </Transition>
  </Teleport>

  <aside
    id="dashboard-sidebar"
    class="sidebar"
    :class="{ 'sidebar--open': modelValue, 'sidebar--collapsed': collapsed && !isMobile }"
    aria-label="Dashboard navigation"
    :aria-hidden="isMobile && !modelValue ? 'true' : undefined"
    :inert="isMobile && !modelValue"
  >
    <div class="sidebar-header">
      <a href="/" class="brand" aria-label="MehrakBot home">
        <img src="/logo.webp" alt="" class="brand-mark" />
        <span><strong>MehrakBot</strong><small>Dashboard</small></span>
      </a>
      <button
        type="button"
        class="sidebar-collapse"
        :aria-label="collapsed ? 'Expand dashboard navigation' : 'Collapse dashboard navigation'"
        :aria-pressed="collapsed"
        @click="toggleCollapsed"
      >
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" aria-hidden="true"></i>
      </button>
      <button
        ref="closeButton"
        class="sidebar-close"
        type="button"
        aria-label="Close menu"
        @click="close(true)"
      >
        <i class="pi pi-times" aria-hidden="true"></i>
      </button>
    </div>

    <nav class="sidebar-nav" aria-label="Dashboard">
      <section class="nav-group" aria-labelledby="nav-account">
        <h2 id="nav-account">Overview</h2>
        <router-link
          to="/dashboard"
          class="nav-item"
          :class="{ active: isActive('dashboard-home') }"
          :aria-current="isActive('dashboard-home') ? 'page' : undefined"
          aria-label="Overview"
          @click="close(true)"
        >
          <i class="pi pi-compass" aria-hidden="true"></i><span>Overview</span>
        </router-link>
      </section>

      <section class="nav-group" aria-labelledby="nav-commands">
        <h2 id="nav-commands">Games</h2>
        <router-link
          v-for="game in games"
          :key="game.id"
          :to="`/dashboard/${game.routeKey}`"
          class="nav-item game-item"
          :class="{ active: isGameActive(game.routeKey) }"
          :aria-current="isGameActive(game.routeKey) ? 'page' : undefined"
          :style="game.gameColorStyle"
          :aria-label="game.label"
          @click="close(true)"
        >
          <img :src="game.logo" :alt="`${game.label} logo`" />
          <span>{{ game.label }}</span>
        </router-link>
      </section>

      <section v-if="hasGlobalManagement" class="nav-group" aria-labelledby="nav-global-management">
        <h2 id="nav-global-management">Administration</h2>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/users"
          class="nav-item"
          :class="{ active: isActive('user-management') }"
          :aria-current="isActive('user-management') ? 'page' : undefined"
          aria-label="Users"
          @click="close(true)"
        >
          <i class="pi pi-users" aria-hidden="true"></i><span>Users</span>
        </router-link>
        <router-link
          to="/dashboard/docs"
          class="nav-item"
          :class="{ active: isActive('docs-management') }"
          :aria-current="isActive('docs-management') ? 'page' : undefined"
          aria-label="Documentation"
          @click="close(true)"
        >
          <i class="pi pi-book" aria-hidden="true"></i><span>Documentation</span>
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/release-notes"
          class="nav-item"
          :class="{ active: isActive('release-notes-management') }"
          :aria-current="isActive('release-notes-management') ? 'page' : undefined"
          aria-label="Release notes"
          @click="close(true)"
        >
          <i class="pi pi-megaphone" aria-hidden="true"></i><span>Release notes</span>
        </router-link>
        <a
          v-if="isSuperAdmin"
          :href="`${backendUrl}/admin/seaweed-filer/`"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-item"
          aria-label="Seaweed Filer"
          @click="close(true)"
        >
          <i class="pi pi-external-link" aria-hidden="true"></i><span>Seaweed Filer</span>
        </a>
      </section>
    </nav>
    <footer class="sidebar-footer">
      <div class="account-context">
        <img
          v-if="userInfo.avatarUrl"
          :src="userInfo.avatarUrl"
          :alt="`${userInfo.username} avatar`"
        />
        <span
          ><strong>{{ userInfo.username || "Discord user" }}</strong
          ><small>{{ isSuperAdmin ? "Super administrator" : "Dashboard user" }}</small></span
        >
        <ThemeToggle />
      </div>
      <button
        type="button"
        class="logout-button"
        :disabled="logoutStatus === 'pending'"
        @click="handleLogout"
      >
        <i class="pi pi-sign-out" aria-hidden="true"></i
        ><span>{{ logoutStatus === "pending" ? "Signing out…" : "Log out" }}</span>
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  width: 17.5rem;
  flex-direction: column;
  border-right: 1px solid var(--border-primary);
  background: var(--bg-surface);
}
.sidebar-header {
  display: flex;
  min-height: var(--control-size);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}
.brand {
  display: flex;
  min-height: var(--control-size);
  align-items: center;
  gap: var(--space-3);
  color: var(--text-primary);
  text-decoration: none;
}
.brand-mark {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
}
.brand span,
.account-context span {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.brand strong {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  line-height: 1.1;
}
.brand small,
.account-context small {
  color: var(--text-muted);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.sidebar-collapse {
  display: grid;
  width: var(--control-size);
  height: var(--control-size);
  padding: 0;
  place-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.sidebar-close {
  display: none;
  width: var(--control-size);
  height: var(--control-size);
  place-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}
.nav-group + .nav-group {
  margin-top: var(--space-6);
}
.nav-group h2 {
  margin: 0 0 var(--space-2);
  padding: 0 var(--space-2);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--control-size);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background var(--motion-fast),
    color var(--motion-fast);
}
.nav-item:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
}
.nav-item.game-item.active {
  background: color-mix(in oklch, var(--game-color) 14%, transparent);
  color: var(--text-primary);
}
.nav-item i {
  width: 1rem;
  text-align: center;
}
.game-item {
  --game-color: var(--accent);
}
.game-item img {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-primary);
  background: var(--bg-surface-sunken);
}
.account-context {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.account-context > img {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-secondary);
  border-radius: 50%;
  object-fit: cover;
}
.account-context strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logout-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.sidebar--collapsed {
  width: 4.5rem;
  overflow-x: hidden;
}

.sidebar--collapsed .sidebar-header {
  flex-direction: column;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-2);
}

.sidebar--collapsed .sidebar-footer {
  padding: var(--space-3) var(--space-2);
}

.sidebar--collapsed .brand {
  width: var(--control-size);
  justify-content: center;
}

.sidebar--collapsed .brand span,
.sidebar--collapsed .nav-group h2,
.sidebar--collapsed .nav-item > span,
.sidebar--collapsed .account-context > span,
.sidebar--collapsed .logout-button span {
  display: none;
}

.sidebar--collapsed .sidebar-nav {
  padding-inline: var(--space-2);
}

.sidebar--collapsed .nav-group + .nav-group {
  margin-top: var(--space-3);
}

.sidebar--collapsed .nav-item {
  width: var(--control-size);
  height: var(--control-size);
  min-height: var(--control-size);
  margin-inline: auto;
  padding: 0;
  justify-content: center;
  gap: 0;
}

.sidebar--collapsed .nav-item i {
  width: auto;
  font-size: var(--text-lg);
}

.sidebar--collapsed .nav-item.game-item img {
  width: 2rem;
  height: 2rem;
}

.sidebar--collapsed .account-context {
  display: flex;
  margin-bottom: var(--space-2);
  justify-content: center;
}

.sidebar--collapsed .account-context > img {
  display: none;
}

.sidebar--collapsed .logout-button {
  width: var(--control-size);
  height: var(--control-size);
  min-height: var(--control-size);
  margin-inline: auto;
  padding: 0;
}
.logout-button:hover {
  border-color: var(--danger);
  color: var(--danger);
}
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  border: 0;
  background: color-mix(in srgb, var(--bg-surface-sunken) 72%, transparent);
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 768px) {
  .sidebar {
    width: min(19rem, calc(100vw - 2.5rem));
    transform: translateX(-105%);
    transition: transform var(--motion-base) var(--ease-enter);
  }
  .sidebar--open {
    transform: translateX(0);
  }
  .sidebar-close {
    display: grid;
  }
  .sidebar-collapse {
    display: none;
  }
}
</style>
