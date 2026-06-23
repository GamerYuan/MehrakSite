<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import ThemeToggle from "./ThemeToggle.vue";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();
const { user, fetchUser, logout } = useAuth();

const navLinks = [
  { label: "Home", path: "/", section: "home" },
  { label: "Features", path: "/#features", section: "features" },
  { label: "Documentations", path: "/docs", section: null },
];

const activeSection = ref("home");
const mobileMenuOpen = ref(false);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false;
  }
};

const handleLogin = () => {
  globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
};

function onScroll() {
  const featuresEl = document.getElementById("features");
  if (!featuresEl) {
    activeSection.value = "home";
    return;
  }
  const rect = featuresEl.getBoundingClientRect();
  activeSection.value = rect.top < globalThis.innerHeight / 2 ? "features" : "home";
}

onMounted(() => {
  globalThis.addEventListener("scroll", onScroll, { passive: true });
  globalThis.addEventListener("click", closeDropdown);
  onScroll();
  fetchUser();
});

onUnmounted(() => {
  globalThis.removeEventListener("scroll", onScroll);
  globalThis.removeEventListener("click", closeDropdown);
});

function isActive(link) {
  if (link.section && route.path === "/") {
    return activeSection.value === link.section;
  }
  return route.path === link.path;
}

function handleNavClick(link) {
  mobileMenuOpen.value = false;
  if (link.path === "/") {
    if (route.path === "/") {
      globalThis.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
    return;
  }

  if (link.path.startsWith("/#")) {
    router.push({ path: "/", hash: link.path.substring(1) });
  } else {
    router.push(link.path);
  }
}
</script>

<template>
  <nav class="nav">
    <div
      class="nav-logo"
      role="button"
      tabindex="0"
      @click="router.push('/')"
      @keydown.enter.prevent="router.push('/')"
      @keydown.space.prevent="router.push('/')"
    >
      <img src="/logo.webp" alt="MehrakBot" class="logo-icon" />
      <span class="logo-text">MehrakBot</span>
    </div>

    <div class="nav-center">
      <a
        v-for="link in navLinks"
        :key="link.label"
        href="#"
        class="nav-link"
        :class="{ active: isActive(link) }"
        @click.prevent="handleNavClick(link)"
      >
        {{ link.label }}
      </a>
      <a
        href="https://github.com/GamerYuan/MehrakBot"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
      >
        GitHub
      </a>
    </div>

    <button
      class="mobile-menu-btn"
      aria-label="Toggle menu"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
      <span class="hamburger-line" :class="{ open: mobileMenuOpen }"></span>
    </button>

    <div v-if="mobileMenuOpen" class="mobile-menu">
      <a
        v-for="link in navLinks"
        :key="link.label"
        href="#"
        class="nav-link"
        :class="{ active: isActive(link) }"
        @click.prevent="handleNavClick(link)"
      >
        {{ link.label }}
      </a>
      <a
        href="https://github.com/GamerYuan/MehrakBot"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
      >
        GitHub
      </a>
      <template v-if="user">
        <Button
          label="Dashboard"
          icon="pi pi-th-large"
          class="mobile-login-btn"
          @click="
            mobileMenuOpen = false;
            router.push('/dashboard');
          "
        />
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="secondary"
          class="mobile-login-btn"
          @click="
            mobileMenuOpen = false;
            logout();
          "
        />
      </template>
      <Button
        v-else
        label="Login with Discord"
        icon="pi pi-user"
        class="mobile-login-btn"
        @click="handleLogin"
      />
    </div>

    <div class="nav-right">
      <ThemeToggle />
      <Button
        as="a"
        label="Invite Bot"
        icon="pi pi-discord"
        href="https://discord.com/oauth2/authorize?client_id=1365154828430610532"
        target="_blank"
        rel="noopener noreferrer"
        class="invite-btn"
      />
      <template v-if="user">
        <div class="user-dropdown" ref="dropdownRef">
          <button class="user-trigger" @click.stop="toggleDropdown">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="user.username"
              class="trigger-avatar"
            />
            <span class="trigger-name">{{ user.username }}</span>
            <i class="pi pi-chevron-down trigger-chevron"></i>
          </button>
        </div>
        <Teleport to="body">
          <div v-if="dropdownOpen" class="dropdown-panel" @click="dropdownOpen = false">
            <div class="dropdown-inner" @click.stop>
              <div class="dropdown-header">
                <img
                  v-if="user.avatarUrl"
                  :src="user.avatarUrl"
                  :alt="user.username"
                  class="dropdown-avatar"
                />
                <div class="dropdown-user-info">
                  <span class="dropdown-username">{{ user.username }}</span>
                  <span class="dropdown-discord-id">ID: {{ user.discordUserId }}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <button
                class="dropdown-item"
                @click="
                  dropdownOpen = false;
                  router.push('/dashboard');
                "
              >
                <i class="pi pi-th-large"></i>
                <span>Dashboard</span>
              </button>
              <div class="dropdown-divider"></div>
              <button
                class="dropdown-item dropdown-item-danger"
                @click="
                  dropdownOpen = false;
                  logout();
                "
              >
                <i class="pi pi-sign-out"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </Teleport>
      </template>
      <Button
        v-else
        label="Login with Discord"
        icon="pi pi-user"
        class="login-btn"
        @click="handleLogin"
      />
    </div>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background: var(--navbar-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-primary);
  z-index: 100;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}

.logo-text {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
  padding-bottom: 0.25rem;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.active {
  color: var(--accent);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.invite-btn :deep(.p-button) {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
}

.invite-btn :deep(.p-button:hover) {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}

.invite-btn :deep(.p-button-icon) {
  color: inherit;
}

.login-btn :deep(.p-button) {
  background: #5865f2;
  border-color: #5865f2;
  color: #fff;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
}

.login-btn :deep(.p-button:hover) {
  background: #4752c4;
  border-color: #4752c4;
}

/* ── User dropdown ─────────────────────── */

.user-dropdown {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  height: 2.375rem;
  border-radius: 6px;
  border: 1px solid var(--border-primary);
  background: var(--bg-surface-raised);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.user-trigger:hover {
  border-color: var(--border-secondary);
}

.trigger-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.trigger-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  font-size: 0.625rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .nav {
    padding: 0.75rem;
  }

  .logo-text {
    display: none;
  }

  .nav-center {
    display: none;
  }

  .nav-right {
    gap: 0.375rem;
  }

  .mobile-menu-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .hamburger-line {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transition:
      transform 0.2s,
      opacity 0.2s;
  }

  .hamburger-line.open:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }

  .hamburger-line.open:nth-child(2) {
    opacity: 0;
  }

  .hamburger-line.open:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-overlay);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-primary);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.75rem;
    z-index: 99;
  }

  .mobile-menu .nav-link {
    font-size: 1rem;
    padding: 0.5rem 0;
  }

  .mobile-login-btn :deep(.p-button) {
    width: 100%;
    background: #5865f2;
    border-color: #5865f2;
    color: #fff;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .invite-btn :deep(.p-button-label) {
    display: none;
  }

  .invite-btn :deep(.p-button) {
    padding: 0.55rem;
  }

  .user-trigger {
    width: auto;
    justify-content: center;
    height: 2.375rem;
  }

  .trigger-name {
    display: none;
  }

  .trigger-chevron {
    display: none;
  }

  .login-btn :deep(.p-button-label) {
    display: none;
  }

  .login-btn :deep(.p-button) {
    padding: 0.55rem;
  }
}

@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }
}
</style>

<style>
.dropdown-panel {
  position: fixed;
  top: 4rem;
  right: 2.5rem;
  width: 220px;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 200;
  overflow: hidden;
}

.dropdown-inner {
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem;
}

.dropdown-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dropdown-username {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-discord-id {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-primary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.1s ease,
    color 0.1s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.dropdown-item i {
  font-size: 0.875rem;
  width: 1rem;
  text-align: center;
}

.dropdown-item-danger {
  color: #ef4444;
}

.dropdown-item-danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

@media (max-width: 768px) {
  .dropdown-panel {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    box-shadow: none;
    border: none;
    border-radius: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1.5rem;
    overflow-y: auto;
  }

  .dropdown-inner {
    display: flex;
    flex-direction: column;
  }

  .dropdown-header {
    padding: 1.25rem;
  }

  .dropdown-avatar {
    width: 3rem;
    height: 3rem;
  }

  .dropdown-username {
    font-size: 1rem;
  }

  .dropdown-discord-id {
    font-size: 0.8125rem;
  }

  .dropdown-item {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }

  .dropdown-item i {
    font-size: 1rem;
    width: 1.25rem;
  }
}
</style>
