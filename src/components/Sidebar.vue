<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { gameMeta } from "../configs/gameMeta";
import ThemeToggle from "./ThemeToggle.vue";

const router = useRouter();
const route = useRoute();
const { user, logout, isSuperAdmin } = useAuth();

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const handleLogout = () => {
  logout();
};

const gameRouteMap = {
  genshin: "Genshin",
  hsr: "HonkaiStarRail",
  zzz: "ZenlessZoneZero",
  hi3: "HonkaiImpact3",
};

const gameRoutes = Object.keys(gameRouteMap).map((key) => {
  const meta = gameMeta[gameRouteMap[key]];
  return { key, label: meta.label, logo: meta.logo, metaKey: gameRouteMap[key] };
});

const isActive = (path) => route.path === path;
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="sidebar-backdrop" @click="close"></div>
    </Transition>
  </Teleport>

  <aside class="sidebar" :class="{ 'sidebar--open': modelValue }">
    <div class="sidebar-header">
      <div class="sidebar-header-content" @click="router.push('/')" role="button" tabindex="0">
        <img src="/logo.webp" alt="MehrakBot" class="sidebar-logo-icon" />
        <span class="sidebar-logo-text">MehrakBot</span>
      </div>
      <ThemeToggle />
      <button class="sidebar-close-btn" @click="close" aria-label="Close menu">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group">
        <span class="nav-group-label">Account</span>
        <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }" @click="close">
          <i class="pi pi-user nav-icon"></i>
          <span>Profile</span>
        </router-link>
      </div>

      <div class="nav-group">
        <span class="nav-group-label">Games</span>
        <router-link
          v-for="g in gameRoutes"
          :key="g.key"
          :to="`/dashboard/${g.key}`"
          class="nav-item game-nav-item"
          :class="{ active: isActive(`/dashboard/${g.key}`) }"
          :data-game="g.key"
          @click="close"
        >
          <img
            :src="g.logo"
            class="nav-game-logo"
            :alt="g.label"
          />
          <span>{{ g.label }}</span>
          <span
            class="game-dot"
            :style="{ backgroundColor: gameMeta[g.metaKey].color }"
          ></span>
        </router-link>
      </div>

      <div v-if="isSuperAdmin || user.gameWritePermissions?.length" class="nav-group">
        <span class="nav-group-label">Management</span>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/users"
          class="nav-item"
          :class="{ active: isActive('/dashboard/users') }"
          @click="close"
        >
          <i class="pi pi-users nav-icon"></i>
          <span>User Management</span>
        </router-link>
        <router-link
          v-if="isSuperAdmin || user.gameWritePermissions?.length"
          to="/dashboard/docs"
          class="nav-item"
          :class="{ active: isActive('/dashboard/docs') }"
          @click="close"
        >
          <i class="pi pi-book nav-icon"></i>
          <span>Documentation</span>
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/release-notes"
          class="nav-item"
          :class="{ active: isActive('/dashboard/release-notes') }"
          @click="close"
        >
          <i class="pi pi-megaphone nav-icon"></i>
          <span>Release Notes</span>
        </router-link>
        <router-link
          v-if="isSuperAdmin"
          to="/dashboard/seaweed-filer"
          class="nav-item"
          :class="{ active: isActive('/dashboard/seaweed-filer') }"
          @click="close"
        >
          <i class="pi pi-folder nav-icon"></i>
          <span>Seaweed Filer</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-mini-profile">
        <img
          v-if="userInfo.avatarUrl"
          :src="userInfo.avatarUrl"
          :alt="userInfo.username"
          class="user-avatar"
        />
        <span class="username">{{ userInfo.username }}</span>
      </div>
      <button @click="handleLogout" class="logout-btn">
        <i class="pi pi-sign-out"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 1rem;
}

.sidebar-header-content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
}

.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.25rem;
}

.sidebar-logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}

.sidebar-logo-text {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-group-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0 0.75rem;
  margin-bottom: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
  position: relative;
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.nav-game-logo {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
  flex-shrink: 0;
}

.nav-item:hover {
  background-color: var(--bg-surface-raised);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
  font-weight: 500;
}

.game-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: auto;
  flex-shrink: 0;
}

.nav-item.game-nav-item.active[data-game="genshin"] {
  background-color: rgba(255, 215, 0, 0.12);
  color: #b8860b;
}
.dark .nav-item.game-nav-item.active[data-game="genshin"] {
  color: #ffd700;
}

.nav-item.game-nav-item.active[data-game="hsr"] {
  background-color: rgba(0, 212, 255, 0.12);
  color: #0077a8;
}
.dark .nav-item.game-nav-item.active[data-game="hsr"] {
  color: #00d4ff;
}

.nav-item.game-nav-item.active[data-game="zzz"] {
  background-color: rgba(255, 107, 0, 0.12);
  color: #c45200;
}
.dark .nav-item.game-nav-item.active[data-game="zzz"] {
  color: #ff6b00;
}

.nav-item.game-nav-item.active[data-game="hi3"] {
  background-color: rgba(255, 105, 180, 0.12);
  color: #cc3388;
}
.dark .nav-item.game-nav-item.active[data-game="hi3"] {
  color: #ff69b4;
}

.sidebar-footer {
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--border-primary);
}

.user-mini-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem;
  background-color: var(--bg-surface-raised);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: var(--border-secondary);
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-close-btn {
    display: block;
  }

  .nav-item {
    padding: 0.75rem;
  }
}
</style>
