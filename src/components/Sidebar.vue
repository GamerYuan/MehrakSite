<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();
const { logout, isSuperAdmin, hasGamePermission } = useAuth();

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const isActive = (path) => route.path === path;

const handleLogout = () => {
  logout();
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>MehrakBot</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ active: isActive('/dashboard') }"
      >
        Profile
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/users"
        class="nav-item"
        :class="{ active: isActive('/dashboard/users') }"
      >
        User Management
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/seaweed-filer"
        class="nav-item"
        :class="{ active: isActive('/dashboard/seaweed-filer') }"
      >
        Seaweed Filer
      </router-link>

      <router-link
        v-if="isSuperAdmin || userInfo.gameWritePermissions?.length"
        to="/dashboard/docs"
        class="nav-item"
        :class="{ active: isActive('/dashboard/docs') }"
      >
        Documentation
      </router-link>

      <router-link
        v-if="isSuperAdmin"
        to="/dashboard/release-notes"
        class="nav-item"
        :class="{ active: isActive('/dashboard/release-notes') }"
      >
        Release Notes
      </router-link>

      <router-link
        to="/dashboard/genshin"
        class="nav-item"
        :class="{ active: isActive('/dashboard/genshin') }"
      >
        Genshin Impact
      </router-link>

      <router-link
        to="/dashboard/hsr"
        class="nav-item"
        :class="{ active: isActive('/dashboard/hsr') }"
      >
        Honkai: Star Rail
      </router-link>

      <router-link
        to="/dashboard/zzz"
        class="nav-item"
        :class="{ active: isActive('/dashboard/zzz') }"
      >
        Zenless Zone Zero
      </router-link>

      <router-link
        to="/dashboard/hi3"
        class="nav-item"
        :class="{ active: isActive('/dashboard/hi3') }"
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
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-header h2 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
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
  background-color: var(--primary-color);
  color: white;
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
</style>
