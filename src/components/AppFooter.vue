<script setup>
import { RouterLink } from "vue-router";
import { discordInviteUrl, githubUrl } from "../configs/publicLinks";
</script>

<template>
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <RouterLink to="/" aria-label="MehrakBot home">
          <img src="/logo.webp" alt="" />
          <span>MehrakBot</span>
        </RouterLink>
        <p>Open-source Discord commands for HoYoverse builds, rosters, and endgame records.</p>
      </div>

      <nav aria-label="Product">
        <strong>Product</strong>
        <RouterLink to="/docs">Documentation</RouterLink>
        <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer">
          Invite bot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </a>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer">
          GitHub source <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </a>
      </nav>

      <nav aria-label="Legal">
        <strong>Legal</strong>
        <RouterLink to="/privacy">Privacy policy</RouterLink>
        <RouterLink to="/terms">Terms of service</RouterLink>
      </nav>
    </div>
    <div class="footer-notes">
      <span>GPL-3.0 licensed. Built by GamerYuan.</span>
      <span>MehrakBot is not affiliated with HoYoverse.</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-16) max(var(--space-4), calc((100% - 90rem) / 2)) var(--space-8);
  border-top: 1px solid var(--border-primary);
  background: var(--footer-bg);
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(15rem, 2fr) repeat(2, minmax(8rem, 1fr));
  gap: var(--space-10);
}

.footer-brand a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  text-decoration: none;
}

.footer-brand img {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
}

.footer-brand p {
  max-width: 32rem;
  margin: var(--space-4) 0 0;
  color: var(--text-secondary);
}

.footer nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.footer nav strong {
  margin-bottom: var(--space-2);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.footer nav a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

.footer nav a:hover {
  color: var(--accent-strong);
}

.footer nav i {
  font-size: var(--text-xs);
}

.footer-notes {
  display: flex;
  margin-top: var(--space-10);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-primary);
  justify-content: space-between;
  gap: var(--space-4);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

@media (max-width: 42rem) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-notes {
    flex-direction: column;
  }
}
</style>
