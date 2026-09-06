<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  commandReferencePath,
  cookieDetailsPath,
  dataDeletionPath,
  discordInviteUrl,
  githubUrl,
  privacyPath,
} from "../../../configs/publicLinks";
import PageHeader from "../../ui/PageHeader.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";
import TechnicalLabel from "../../ui/TechnicalLabel.vue";

const props = defineProps({
  journey: { type: String, default: "server" },
});

const emit = defineEmits(["update:journey"]);

const journeys = {
  server: {
    label: "Install for a server",
    heading: "Add MehrakBot to a Discord server",
    summary: "Best when a community wants shared commands and generated cards in its channels.",
    action: "Open the server install page",
  },
  personal: {
    label: "Install for yourself",
    heading: "Add MehrakBot to your Discord account",
    summary:
      "Best when you want to use the app in DMs or servers that allow external applications.",
    action: "Open the personal install page",
  },
};

const activeJourney = computed(() => journeys[props.journey] || journeys.server);
</script>

<template>
  <div class="getting-started">
    <PageHeader
      icon="pi pi-compass"
      title="Getting Started"
      subtitle="Choose an installation path, understand the credential handoff, then run your first command."
    />

    <section aria-labelledby="journey-title">
      <TechnicalLabel>Choose a journey</TechnicalLabel>
      <h2 id="journey-title">How will you use MehrakBot?</h2>
      <div class="journey-picker" role="group" aria-label="Installation journey">
        <button
          v-for="(option, key) in journeys"
          :key="key"
          type="button"
          :class="['journey-option', { active: journey === key }]"
          :aria-pressed="journey === key"
          @click="emit('update:journey', key)"
        >
          <i :class="key === 'server' ? 'pi pi-users' : 'pi pi-user'" aria-hidden="true"></i>
          <span>{{ option.label }}</span>
        </button>
      </div>
    </section>

    <SurfaceCard class="journey-card">
      <TechnicalLabel>{{
        journey === "personal" ? "Personal workflow" : "Server workflow"
      }}</TechnicalLabel>
      <h2>{{ activeJourney.heading }}</h2>
      <p>{{ activeJourney.summary }}</p>
      <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer" class="primary-install">
        {{ activeJourney.action }} <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
      </a>

      <ol v-if="journey === 'server'" class="journey-steps">
        <li>
          <strong>Confirm permission</strong>
          <span>You need Manage Server or Administrator permission in the destination server.</span>
        </li>
        <li>
          <strong>Choose Add to Server</strong>
          <span>Select the server where the shared command workflow should be available.</span>
        </li>
        <li>
          <strong>Run a slash command</strong>
          <span>Type <code>/</code> in a supported channel and choose a MehrakBot command.</span>
        </li>
      </ol>
      <ol v-else class="journey-steps">
        <li>
          <strong>Choose Install to account</strong>
          <span>Authorize MehrakBot as a Discord user application.</span>
        </li>
        <li>
          <strong>Open a supported context</strong>
          <span>Use it in DMs or a server where external applications are enabled.</span>
        </li>
        <li>
          <strong>Run a slash command</strong>
          <span>Type <code>/</code> and choose the result you want.</span>
        </li>
      </ol>

      <RouterLink :to="commandReferencePath" class="reference-link">
        Browse the complete command reference <i class="pi pi-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </SurfaceCard>

    <SurfaceCard id="credential-checkpoint" class="trust-checkpoint">
      <TechnicalLabel>Before adding a game profile</TechnicalLabel>
      <h2>Review how credentials and deletion work.</h2>
      <p>
        Some game commands require HoYoLAB account data. Read these project-controlled resources
        before copying, creating, inspecting, pasting, or storing any cookie or passphrase value.
      </p>
      <nav aria-label="Credential and privacy resources" class="trust-links">
        <RouterLink :to="privacyPath">Privacy policy</RouterLink>
        <RouterLink :to="dataDeletionPath">Data deletion</RouterLink>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer">Public source</a>
        <RouterLink :to="cookieDetailsPath">Cookie details</RouterLink>
      </nav>
    </SurfaceCard>

    <SurfaceCard id="adding-a-profile" class="profile-guide">
      <TechnicalLabel>Optional profile setup</TechnicalLabel>
      <h2>Connect a HoYoLAB profile for game-data commands.</h2>
      <p>Run the profile command in Discord and follow the authentication form:</p>
      <pre><code>/profile add</code></pre>
      <ul>
        <li>Enter the HoYoLAB UID associated with the game account.</li>
        <li>Provide the requested HoYoLAB cookie only after reviewing the resources above.</li>
        <li>Create the passphrase used by MehrakBot for the documented encryption workflow.</li>
      </ul>

      <details>
        <summary>Show the step-by-step cookie instructions</summary>
        <div class="advanced-details">
          <p>
            Sign in to
            <a href="https://www.hoyolab.com/" target="_blank" rel="noopener noreferrer">HoYoLAB</a>
            in the same browser where you will copy the cookie. Do not use a private window.
          </p>

          <section class="browser-guide" aria-labelledby="chromium-cookie-title">
            <h3 id="chromium-cookie-title">
              Chrome, Edge, Brave, Opera, and other Chromium browsers
            </h3>
            <ol>
              <li>Open HoYoLAB and sign in.</li>
              <li>
                Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> to open Developer Tools.
              </li>
              <li>Select the <strong>Application</strong> tab.</li>
              <li>
                In the left sidebar, open <strong>Storage</strong>, then <strong>Cookies</strong>,
                and choose <strong>www.hoyolab.com</strong>.
              </li>
              <li>
                Find the cookie named <code>ltoken_v2</code>, then copy only its
                <strong>Value</strong>.
              </li>
            </ol>
            <figure>
              <img
                src="/docs/getting-started/cookies-chromium-devtools.webp"
                width="2053"
                height="621"
                loading="lazy"
                decoding="async"
                alt="Chromium Developer Tools Application tab showing the HoYoLAB cookies table and ltoken_v2 value"
              />
              <figcaption>
                In Chromium browsers, find <code>ltoken_v2</code> under Application → Storage →
                Cookies.
              </figcaption>
            </figure>
          </section>

          <section class="browser-guide" aria-labelledby="firefox-cookie-title">
            <h3 id="firefox-cookie-title">Firefox</h3>
            <ol>
              <li>Open HoYoLAB and sign in.</li>
              <li>
                Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> to open Developer Tools.
              </li>
              <li>Select the <strong>Storage</strong> tab.</li>
              <li>
                In the left sidebar, open <strong>Cookies</strong>, then choose
                <strong>https://www.hoyolab.com</strong>.
              </li>
              <li>
                Find the cookie named <code>ltoken_v2</code>, then copy only its
                <strong>Value</strong>.
              </li>
            </ol>
            <figure>
              <img
                src="/docs/getting-started/cookies-firefox-devtools.webp"
                width="2317"
                height="558"
                loading="lazy"
                decoding="async"
                alt="Firefox Developer Tools Storage tab showing the HoYoLAB cookies table and ltoken_v2 value"
              />
              <figcaption>
                In Firefox, find <code>ltoken_v2</code> under Storage → Cookies.
              </figcaption>
            </figure>
          </section>

          <p>
            Copy only the value requested by the Discord authentication form. Paste it into the
            HoYoLAB Cookies field, then continue with the passphrase step.
            <RouterLink :to="cookieDetailsPath">Read the cookie details reference</RouterLink> if
            you want the security context before continuing.
          </p>
        </div>
      </details>
    </SurfaceCard>
  </div>
</template>

<style scoped>
.getting-started {
  display: grid;
  gap: var(--space-8);
}

h2 {
  margin: var(--space-3) 0 0;
  color: var(--text-primary);
  font-size: var(--text-2xl);
}

.journey-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: var(--space-5);
  gap: var(--space-3);
}

.journey-option {
  display: flex;
  min-height: 4rem;
  padding: var(--space-3) var(--space-4);
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-weight: 650;
  cursor: pointer;
}

.journey-option.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
  box-shadow: inset 3px 0 var(--accent);
}

.journey-card > p,
.trust-checkpoint > p,
.profile-guide > p {
  margin: var(--space-4) 0 0;
  color: var(--text-secondary);
}

.primary-install,
.reference-link {
  display: inline-flex;
  min-height: var(--control-size);
  align-items: center;
  gap: var(--space-2);
  font-weight: 650;
}

.primary-install {
  margin-top: var(--space-5);
  padding: 0 var(--space-5);
  border: 1px solid var(--accent-strong);
  border-radius: var(--radius-md);
  background: var(--accent-strong);
  color: var(--accent-contrast);
  text-decoration: none;
}

.journey-steps {
  display: grid;
  margin: var(--space-6) 0 0;
  padding: 0;
  gap: var(--space-3);
  list-style: none;
  counter-reset: journey-step;
}

.journey-steps li {
  display: grid;
  grid-template-columns: var(--control-size) minmax(0, 1fr);
  gap: 0 var(--space-3);
  counter-increment: journey-step;
}

.journey-steps li::before {
  grid-row: 1 / 3;
  display: grid;
  width: var(--control-size);
  height: var(--control-size);
  place-items: center;
  border-radius: 50%;
  background: var(--bg-surface-sunken);
  color: var(--accent-strong);
  content: counter(journey-step);
  font-family: var(--font-mono);
  font-weight: 700;
}

.journey-steps span {
  color: var(--text-secondary);
}

.reference-link {
  margin-top: var(--space-5);
  color: var(--accent-strong);
}

.trust-checkpoint {
  border-color: var(--border-secondary);
  background: var(--bg-surface-raised);
}

.trust-links {
  display: flex;
  margin-top: var(--space-5);
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}

.trust-links a {
  display: inline-flex;
  min-height: var(--control-size);
  align-items: center;
  color: var(--accent-strong);
  font-weight: 650;
}

.profile-guide pre {
  overflow-x: auto;
  margin: var(--space-4) 0;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--code-bg);
}

.profile-guide code {
  font-family: var(--font-mono);
}

.profile-guide li {
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}

.profile-guide details {
  margin-top: var(--space-6);
  border-top: 1px solid var(--divider);
  padding-top: var(--space-4);
}

.profile-guide summary {
  min-height: var(--control-size);
  color: var(--text-primary);
  font-weight: 650;
  cursor: pointer;
}

.advanced-details {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-surface-sunken);
  color: var(--text-secondary);
}

.advanced-details a {
  color: var(--accent-strong);
}

.browser-guide {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--divider);
}

.browser-guide h3 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.browser-guide ol {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
  list-style: decimal;
}

.browser-guide li::marker {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-weight: 700;
}

.browser-guide li {
  margin-bottom: var(--space-3);
}

.browser-guide kbd {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.browser-guide figure {
  margin: var(--space-5) 0 0;
}

.browser-guide img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.browser-guide figcaption {
  margin-top: var(--space-2);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

@media (max-width: 40rem) {
  .journey-picker {
    grid-template-columns: minmax(0, 1fr);
  }

  .primary-install {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
  }
}
</style>
