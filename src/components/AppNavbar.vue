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
const featuresVisible = ref(false);
let featuresObserver = null;

const navLinks = [
  { label: "Home", to: "/", key: "home" },
  { label: "Features", to: "/#features", key: "features" },
  { label: "Documentation", to: "/docs", key: "docs" },
];

const isLinkActive = (key) => {
  if (key === "home") return route.path === "/" && !featuresVisible.value;
  if (key === "features") return route.path === "/" && featuresVisible.value;
  return route.path.startsWith(`/${key}`);
};

function observeFeatures() {
  featuresObserver?.disconnect();
  featuresObserver = null;
  if (route.path !== "/") {
    featuresVisible.value = false;
    return;
  }
  const target = document.getElementById("features");
  if (!target) return;
  featuresObserver = new IntersectionObserver(([entry]) => (featuresVisible.value = entry.isIntersecting), {
    rootMargin: "-30% 0px -60% 0px",
  });
  featuresObserver.observe(target);
}

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

watch(
  () => route.fullPath,
  async () => {
    closeMenus();
    await nextTick();
    observeFeatures();
  },
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleOutsideClick);
  fetchUser();
  observeFeatures();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleOutsideClick);
  featuresObserver?.disconnect();
});
</script>

<template>
  <header ref="navRef" class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <RouterLink class="brand" to="/" aria-label="MehrakBot home">
        <img src="/logo.webp" alt="" class="brand-mark" />
        <span class="brand-name">MehrakBot</span>
      </RouterLink>

      <div class="desktop-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="nav-link"
          :class="{ active: isLinkActive(link.key) }"
        >
          {{ link.label }}
        </RouterLink>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="nav-link">
          Source <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
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
            <i class="pi pi-chevron-down" aria-hidden="true"></i>
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
          :aria-label="mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
          aria-controls="public-mobile-menu"
          :aria-expanded="mobileMenuOpen"
          @click.stop="toggleMobileMenu"
        >
          <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" aria-hidden="true"></i>
        </button>
      </div>
    </nav>

    <div v-show="mobileMenuOpen" id="public-mobile-menu" class="mobile-menu">
      <RouterLink v-for="link in navLinks" :key="link.label" :to="link.to">
        {{ link.label }}
      </RouterLink>
      <a :href="githubUrl" target="_blank" rel="noopener noreferrer">
        Source <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
      </a>
      <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer">
        Invite bot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
      </a>
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
  backdrop-filter: blur(1rem) saturate(140%);
  -webkit-backdrop-filter: blur(1rem) saturate(140%);
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
  gap: var(--space-3);
  color: var(--text-primary);
  text-decoration: none;
}

.brand-mark {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
}

.brand-name {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1;
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
  position: relative;
  display: inline-flex;
  padding: var(--space-2) 0;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.nav-link:hover,
.nav-link.active {
  color: var(--accent-strong);
}

.nav-link::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: var(--accent-strong);
  content: "";
  opacity: 0;
  transform: scaleX(0.4);
  transition:
    opacity var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

.nav-link:hover::after,
.nav-link.active::after {
  opacity: 1;
  transform: scaleX(1);
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

.invite-link,
.login-button,
.account-trigger,
.menu-button {
  transition:
    border-color var(--motion-base) var(--ease-standard),
    background var(--motion-base) var(--ease-standard),
    color var(--motion-base) var(--ease-standard);
}

.login-button,
.account-trigger {
  padding: 0 var(--space-3);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
}

.login-button:hover,
.account-trigger:hover {
  border-color: var(--accent);
  background: var(--bg-surface-raised);
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
  color: var(--text-primary);
  cursor: pointer;
}

.menu-button:hover {
  border-color: var(--accent);
  background: var(--bg-surface-raised);
}

.mobile-menu {
  display: none;
}

@media (max-width: 68rem) {
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
    margin: var(--space-2) auto var(--space-4);
    padding: var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    gap: 0;
    background: var(--bg-surface);
    box-shadow: var(--shadow-lg);
    animation: menu-enter var(--motion-base) var(--ease-enter) both;
  }

  .mobile-menu a,
  .mobile-menu button {
    width: 100%;
    min-height: 3rem;
    padding: var(--space-3);
    border: 0;
    border-bottom: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-primary);
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }

  .mobile-menu :where(a, button):hover {
    background: var(--bg-surface-raised);
    color: var(--accent-strong);
  }

  .mobile-menu :where(a, button):last-child {
    border-bottom: 0;
  }
}

@keyframes menu-enter {
  from {
    opacity: 0;
    transform: translateY(calc(-1 * var(--space-2)));
  }
}

@media (max-width: 24rem) {
  .brand-name {
    font-size: var(--text-lg);
  }
}
</style>
