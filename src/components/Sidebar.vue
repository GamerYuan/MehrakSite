<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
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

const isActive = (path) => route.path === path;

const close = () => emit("update:modelValue", false);

const handleLogout = () => {
  logout();
};
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
      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ active: isActive('/dashboard') }"
        @click="close"
      >
        Profile
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/users"
        class="nav-item mobile-hidden"
        :class="{ active: isActive('/dashboard/users') }"
        @click="close"
      >
        User Management
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/seaweed-filer"
        class="nav-item mobile-hidden"
        :class="{ active: isActive('/dashboard/seaweed-filer') }"
        @click="close"
      >
        Seaweed Filer
      </router-link>

      <router-link
        v-if="isSuperAdmin || user.gameWritePermissions?.length"
        to="/dashboard/docs"
        class="nav-item mobile-hidden"
        :class="{ active: isActive('/dashboard/docs') }"
        @click="close"
      >
        Documentation
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/release-notes"
        class="nav-item mobile-hidden"
        :class="{ active: isActive('/dashboard/release-notes') }"
        @click="close"
      >
        Release Notes
      </router-link>

      <router-link
        to="/dashboard/genshin"
        class="nav-item"
        :class="{ active: isActive('/dashboard/genshin') }"
        @click="close"
      >
        Genshin Impact
      </router-link>

      <router-link
        to="/dashboard/hsr"
        class="nav-item"
        :class="{ active: isActive('/dashboard/hsr') }"
        @click="close"
      >
        Honkai: Star Rail
      </router-link>

      <router-link
        to="/dashboard/zzz"
        class="nav-item"
        :class="{ active: isActive('/dashboard/zzz') }"
        @click="close"
      >
        Zenless Zone Zero
      </router-link>

      <router-link
        to="/dashboard/hi3"
        class="nav-item"
        :class="{ active: isActive('/dashboard/hi3') }"
        @click="close"
      >
        Honkai Impact 3rd
      </router-link>
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
      <button @click="handleLogout" class="btn logout-btn">Logout</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
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
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-item:hover {
  background-color: var(--bg-surface-raised);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.user-mini-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: bold;
  color: var(--text-primary);
}

.logout-btn {
  width: 100%;
  padding: 0.6rem;
  background-color: var(--bg-surface-raised);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
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
    padding: 1rem;
  }

  .mobile-hidden {
    display: none;
  }
}
</style>
