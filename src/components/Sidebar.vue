<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import ThemeToggle from "./ThemeToggle.vue";
import {
  canManageGameCapability,
  gameMeta,
  hasAnyGamePermission,
  isSuperAdminUser,
} from "../configs/gameMeta";
import { useAuth } from "../composables/useAuth";

const route = useRoute();
const { logout } = useAuth();
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
const closeButton = ref(null);
const isMobile = ref(false);
let mediaQuery = null;
const updateMobile = () => (isMobile.value = mediaQuery.matches);

const props = defineProps({
  userInfo: { type: Object, required: true },
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "close"]);

const games = Object.values(gameMeta).filter(
  (game) => game.routeKey && game.capabilities?.commands,
);
const managementDestinations = [
  { capability: "characters", label: "Characters", suffix: "manage", icon: "pi-users" },
  { capability: "aliases", label: "Aliases", suffix: "manage/aliases", icon: "pi-tags" },
  { capability: "codes", label: "Codes", suffix: "manage/codes", icon: "pi-ticket" },
  {
    capability: "weaponIcons",
    label: "Weapon icons",
    suffix: "manage/weapon-icons",
    icon: "pi-images",
  },
];

const isSuperAdmin = computed(() => isSuperAdminUser(props.userInfo));
const hasGlobalManagement = computed(() => hasAnyGamePermission(props.userInfo));
const managedGames = computed(() =>
  games
    .map((game) => ({
      game,
      links: managementDestinations.filter((item) =>
        canManageGameCapability(props.userInfo, game.id, item.capability),
      ),
    }))
    .filter((game) => game.links.length),
);

const close = (restoreFocus = false) => {
  const wasOpen = props.modelValue;
  emit("update:modelValue", false);
  if (restoreFocus && wasOpen) emit("close");
};
const isActive = (path) => route.path === path;
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
    :class="{ 'sidebar--open': modelValue }"
    aria-label="Dashboard navigation"
    :aria-hidden="isMobile && !modelValue ? 'true' : undefined"
    :inert="isMobile && !modelValue"
  >
    <div class="sidebar-header">
      <a href="/" class="brand" aria-label="MehrakBot home">
        <img src="/logo.webp" alt="" class="brand-mark" />
        <span><strong>MehrakBot</strong><small>Celestial field station</small></span>
      </a>
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

    <nav class="sidebar-nav" aria-label="Operations console">
      <section class="nav-group" aria-labelledby="nav-account">
        <h2 id="nav-account">Account</h2>
        <router-link
          to="/dashboard"
          class="nav-item"
          :class="{ active: isActive('/dashboard') }"
          @click="close(true)"
        >
          <i class="pi pi-compass" aria-hidden="true"></i><span>Overview</span>
        </router-link>
      </section>

      <section class="nav-group" aria-labelledby="nav-commands">
        <h2 id="nav-commands">Game commands</h2>
        <router-link
          v-for="game in games"
          :key="game.id"
          :to="`/dashboard/${game.routeKey}`"
          class="nav-item game-item"
          :class="{ active: isActive(`/dashboard/${game.routeKey}`) }"
          :style="{ '--game-color': `var(--game-${game.routeKey})` }"
          @click="close(true)"
        >
          <img :src="game.logo" :alt="`${game.label} logo`" />
          <span>{{ game.label }}</span
          ><span class="signal" aria-hidden="true"></span>
        </router-link>
      </section>

      <section v-if="managedGames.length" class="nav-group" aria-labelledby="nav-game-management">
        <h2 id="nav-game-management">Game management</h2>
        <details
          v-for="entry in managedGames"
          :key="entry.game.id"
          :open="route.path.startsWith(`/dashboard/${entry.game.routeKey}/manage`)"
          class="game-management"
        >
          <summary>
            <img :src="entry.game.logo" alt="" /><span>{{ entry.game.shortLabel }}</span
            ><i class="pi pi-chevron-down" aria-hidden="true"></i>
          </summary>
          <router-link
            v-for="item in entry.links"
            :key="item.capability"
            :to="`/dashboard/${entry.game.routeKey}/${item.suffix}`"
            class="management-link"
            :class="{ active: isActive(`/dashboard/${entry.game.routeKey}/${item.suffix}`) }"
            @click="close(true)"
          >
            <i class="pi" :class="item.icon" aria-hidden="true"></i><span>{{ item.label }}</span>
          </router-link>
        </details>
      </section>

      <section v-if="hasGlobalManagement" class="nav-group" aria-labelledby="nav-global-management">
        <h2 id="nav-global-management">Global management</h2>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/users"
          class="nav-item"
          :class="{ active: isActive('/dashboard/users') }"
          @click="close(true)"
        >
          <i class="pi pi-users" aria-hidden="true"></i><span>Users</span>
        </router-link>
        <router-link
          to="/dashboard/docs"
          class="nav-item"
          :class="{ active: isActive('/dashboard/docs') }"
          @click="close(true)"
        >
          <i class="pi pi-book" aria-hidden="true"></i><span>Documentation</span>
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/release-notes"
          class="nav-item"
          :class="{ active: isActive('/dashboard/release-notes') }"
          @click="close(true)"
        >
          <i class="pi pi-megaphone" aria-hidden="true"></i><span>Release notes</span>
        </router-link>
      </section>

      <section v-if="isSuperAdmin" class="nav-group" aria-labelledby="nav-tools">
        <h2 id="nav-tools">External tools</h2>
        <a
          :href="`${backendUrl}/admin/seaweed-filer/`"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-item"
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
          ><strong>{{ userInfo.username || "Discord operator" }}</strong
          ><small>{{ isSuperAdmin ? "Super administrator" : "Station operator" }}</small></span
        >
        <ThemeToggle />
      </div>
      <button type="button" class="logout-button" @click="logout">
        <i class="pi pi-sign-out" aria-hidden="true"></i><span>End session</span>
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
  box-shadow: var(--shadow-md);
}
.sidebar::before {
  content: "";
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--brass), transparent);
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}
.brand {
  display: flex;
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
.sidebar-close {
  display: none;
  width: 2.25rem;
  height: 2.25rem;
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
.nav-item,
.management-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background var(--motion-fast),
    color var(--motion-fast);
}
.nav-item:hover,
.management-link:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}
.nav-item.active,
.management-link.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
}
.nav-item i,
.management-link i {
  width: 1rem;
  text-align: center;
}
.game-item {
  --game-color: var(--accent);
}
.game-item img,
.game-management img {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
.game-item.active {
  box-shadow: inset 3px 0 var(--game-color);
}
.signal {
  width: 0.4rem;
  height: 0.4rem;
  margin-left: auto;
  border-radius: 50%;
  background: var(--game-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--game-color) 18%, transparent);
}
.game-management {
  margin-bottom: var(--space-1);
}
.game-management summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  list-style: none;
}
.game-management summary::-webkit-details-marker {
  display: none;
}
.game-management summary:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}
.game-management summary i {
  margin-left: auto;
  font-size: 0.7rem;
  transition: transform var(--motion-fast);
}
.game-management[open] summary i {
  transform: rotate(180deg);
}
.management-link {
  min-height: 2.15rem;
  margin-left: 1.25rem;
  padding-left: var(--space-4);
  font-size: var(--text-xs);
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
}
</style>
