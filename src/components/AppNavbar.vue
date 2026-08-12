<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import ThemeToggle from "./ThemeToggle.vue";
import { useAuth } from "../composables/useAuth";
import { discordInviteUrl, githubUrl } from "../configs/publicLinks";

const route = useRoute();
const { user, fetchUser, login, logout } = useAuth();
const navRef = ref(null);
const menuButtonRef = ref(null);
const accountButtonRef = ref(null);
const mobileMenuOpen = ref(false);
const accountOpen = ref(false);

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Capabilities", to: "/#features" },
  { label: "Field guide", to: "/docs" },
];

function closeMenus() {
  mobileMenuOpen.value = false;
  accountOpen.value = false;
}

async function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  accountOpen.value = false;
  if (mobileMenuOpen.value) {
    await nextTick();
    navRef.value?.querySelector("#public-mobile-menu a")?.focus();
  }
}

function handleKeydown(event) {
  if (event.key !== "Escape" || (!mobileMenuOpen.value && !accountOpen.value)) return;
  const returnFocus = mobileMenuOpen.value ? menuButtonRef.value : accountButtonRef.value;
  closeMenus();
  returnFocus?.focus();
}

function handleOutsideClick(event) {
  if (!navRef.value?.contains(event.target)) closeMenus();
}

watch(() => route.fullPath, closeMenus);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleOutsideClick);
  fetchUser();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <header ref="navRef" class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <RouterLink class="brand" to="/" aria-label="MehrakBot home">
        <img src="/logo.webp" alt="" class="brand-mark" />
        <span class="brand-name">MehrakBot</span>
        <span class="brand-index" aria-hidden="true">FIELD / 01</span>
      </RouterLink>

      <div class="desktop-links">
        <RouterLink v-for="link in navLinks" :key="link.label" :to="link.to" class="nav-link">
          {{ link.label }}
        </RouterLink>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="nav-link">
          Source <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="nav-actions">
        <ThemeToggle />
        <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer" class="invite-link">
          Invite bot
        </a>

        <div v-if="user" class="account">
          <button
            ref="accountButtonRef"
            class="account-trigger"
            type="button"
            aria-controls="account-menu"
            :aria-expanded="accountOpen"
            @click.stop="accountOpen = !accountOpen"
          >
            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" />
            <span>{{ user.username }}</span>
            <span aria-hidden="true">⌄</span>
          </button>
          <div v-show="accountOpen" id="account-menu" class="account-menu">
            <RouterLink to="/dashboard">Open dashboard</RouterLink>
            <button type="button" @click="logout">Log out</button>
          </div>
        </div>
        <button v-else type="button" class="login-button" @click="login">Log in</button>

        <button
          ref="menuButtonRef"
          type="button"
          class="menu-button"
          aria-label="Toggle navigation menu"
          aria-controls="public-mobile-menu"
          :aria-expanded="mobileMenuOpen"
          @click.stop="toggleMobileMenu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <div v-show="mobileMenuOpen" id="public-mobile-menu" class="mobile-menu">
      <RouterLink v-for="link in navLinks" :key="link.label" :to="link.to">
        {{ link.label }}
      </RouterLink>
      <a :href="githubUrl" target="_blank" rel="noopener noreferrer">Source ↗</a>
      <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer">Invite bot ↗</a>
      <RouterLink v-if="user" to="/dashboard">Dashboard</RouterLink>
      <button v-if="user" type="button" @click="logout">Log out</button>
      <button v-else type="button" @click="login">Log in with Discord</button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-primary);
  background: var(--navbar-bg);
}

.nav {
  display: flex;
  width: min(100% - 2rem, 90rem);
  min-height: 4.75rem;
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  text-decoration: none;
}

.brand-mark {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
}

.brand-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1;
}

.brand-index {
  margin-left: var(--space-2);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.12em;
}

.desktop-links,
.nav-actions {
  display: flex;
  align-items: center;
}

.desktop-links {
  gap: clamp(var(--space-4), 2.2vw, var(--space-8));
}

.nav-actions {
  gap: var(--space-2);
}

.nav-link {
  padding: var(--space-2) 0;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: var(--accent-strong);
}

.invite-link,
.login-button,
.account-trigger {
  min-height: 2.5rem;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.invite-link {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-4);
  border-color: var(--accent-strong);
  background: var(--accent-strong);
  color: var(--accent-contrast);
  text-decoration: none;
}

.invite-link:hover {
  background: var(--accent);
}

.login-button,
.account-trigger {
  padding: 0 var(--space-3);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
}

.account {
  position: relative;
}

.account-trigger {
  display: flex;
  max-width: 10rem;
  align-items: center;
  gap: var(--space-2);
}

.account-trigger img {
  width: 1.5rem;
  height: 1.5rem;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.account-trigger span:nth-child(2) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  display: grid;
  width: 12rem;
  padding: var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.account-menu a,
.account-menu button {
  padding: var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.account-menu :where(a, button):hover {
  background: var(--bg-surface-raised);
}

.menu-button {
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.55rem;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  cursor: pointer;
}

.menu-button span {
  display: block;
  width: 100%;
  height: 1px;
  margin: 0.25rem 0;
  background: var(--text-primary);
}

.mobile-menu {
  display: none;
}

@media (max-width: 68rem) {
  .brand-index,
  .desktop-links,
  .nav-actions > .invite-link,
  .nav-actions > .account,
  .nav-actions > .login-button {
    display: none;
  }

  .menu-button {
    display: block;
  }

  .mobile-menu {
    display: grid;
    width: min(100% - 2rem, 90rem);
    margin: 0 auto;
    padding: var(--space-2) 0 var(--space-5);
    gap: var(--space-1);
  }

  .mobile-menu a,
  .mobile-menu button {
    width: 100%;
    padding: var(--space-3) var(--space-2);
    border: 0;
    border-bottom: 1px solid var(--border-primary);
    background: transparent;
    color: var(--text-primary);
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
}

@media (max-width: 24rem) {
  .brand-name {
    font-size: var(--text-lg);
  }
}
</style>
