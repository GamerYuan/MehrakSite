<script setup>
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Card from "primevue/card";

const router = useRouter();

const handleDiscordLogin = () => {
  window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
};
</script>

<template>
  <div class="login-page">
    <Card class="login-card">
      <template #content>
        <div class="login-inner">
          <div class="login-logo">
            <img src="/logo.webp" alt="Mehrak" class="login-logo-img" />
          </div>
          <h1 class="login-title">Mehrak Dashboard</h1>
          <p class="login-sub">Sign in with your Discord account to continue.</p>

          <Button
            label="Login with Discord"
            icon="pi pi-discord"
            class="discord-btn"
            @click="handleDiscordLogin"
          />

          <Button
            label="Back to Home"
            link
            class="back-link"
            @click="router.push('/')"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: var(--page-gradient);
}

.login-card {
  width: 100%;
  max-width: 24rem;
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 1rem !important;
}

.login-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
}

.login-logo {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  overflow: hidden;
}

.login-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}

.login-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}

.discord-btn {
  width: 100%;
  margin-top: 0.5rem;
  background: #5865f2 !important;
  border-color: #5865f2 !important;
  font-weight: 600;
}

.discord-btn:hover {
  background: #4752c4 !important;
  border-color: #4752c4 !important;
}

.back-link {
  color: var(--text-muted) !important;
  font-size: 0.8125rem !important;
}
</style>
