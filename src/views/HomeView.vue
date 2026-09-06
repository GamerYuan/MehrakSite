<script setup>
import { computed, ref } from "vue";
import { discordInviteUrl } from "../configs/publicLinks";
import { gameConfigs } from "../configs/gameConfigs";
import { homepageDocsRoute, homepageShowcases as showcases } from "../configs/homepageShowcases";
import CommandPreview from "../components/ui/CommandPreview.vue";
import ImageDialog from "../components/ui/ImageDialog.vue";
import ShowcaseMedia from "../components/ui/ShowcaseMedia.vue";

const games = Object.values(gameConfigs).filter((game) => game.routeKey);

const steps = [
  { title: "Choose a command", text: "Pick the card or record you want from the command list." },
  { title: "Run it in Discord", text: "Choose the game account and options in the command form." },
  { title: "Share the result", text: "MehrakBot posts a finished image back to the channel." },
];

const expandedShowcase = ref(null);
const dialogVisible = computed({
  get: () => Boolean(expandedShowcase.value),
  set: (visible) => {
    if (!visible) expandedShowcase.value = null;
  },
});

const docsRoute = homepageDocsRoute;
</script>

<template>
  <article class="home">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <h1 id="home-title">Turn game data into cards worth sharing.</h1>
        <p class="hero-lede">
          MehrakBot brings builds, rosters, and endgame records into Discord as clear visual
          summaries for supported HoYoverse games.
        </p>
        <div class="hero-actions">
          <a
            :href="discordInviteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="primary-action"
          >
            Invite MehrakBot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
          </a>
          <RouterLink to="/docs?tab=commands" class="secondary-action">
            Explore commands <i class="pi pi-arrow-right" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>

      <CommandPreview
        command="/genshin character characters:Nahida"
        label="Example Discord command"
      >
        <picture class="hero-output">
          <source
            type="image/webp"
            srcset="
              /showcase/builds-1-480.webp   480w,
              /showcase/builds-1-768.webp   768w,
              /showcase/builds-1-1200.webp 1200w,
              /showcase/builds-1-1600.webp 1600w
            "
            sizes="(max-width: 56rem) calc(100vw - 2rem), 46vw"
          />
          <img
            src="/showcase/builds-1-1200.webp"
            width="3240"
            height="1080"
            alt="Generated Genshin Impact build card for Nahida with equipment and stats"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </CommandPreview>
    </section>

    <section class="games" aria-labelledby="games-title">
      <div class="section-heading">
        <h2 id="games-title">Supported games</h2>
        <p>MehrakBot works with these titles — same commands, same flow.</p>
      </div>
      <ul class="game-list">
        <li v-for="game in games" :key="game.routeKey" :style="game.gameColorStyle">
          <img :src="game.logo" alt="" width="32" height="32" />
          <span>{{ game.label }}</span>
        </li>
      </ul>
    </section>

    <section id="features" class="showcases" aria-labelledby="features-title">
      <div class="section-heading">
        <h2 id="features-title">See what each command gives back.</h2>
        <p>Open the full result or jump directly to the matching command documentation.</p>
      </div>

      <div class="showcase-list">
        <article
          v-for="(showcase, index) in showcases"
          :id="showcase.id"
          :key="showcase.id"
          class="showcase-card"
          :class="{ 'showcase-card--reverse': index % 2 }"
        >
          <ShowcaseMedia
            :src="showcase.src"
            :srcset="showcase.srcset"
            sizes="(max-width: 56rem) calc(100vw - 2rem), 54vw"
            :width="showcase.width"
            :height="showcase.height"
            :alt="showcase.alt"
            :command="showcase.command"
            :expand-label="`Expand ${showcase.title} image`"
            @expand="expandedShowcase = showcase"
          />

          <div class="showcase-copy">
            <h3>{{ showcase.title }}</h3>
            <p>{{ showcase.description }}</p>
            <div class="showcase-actions">
              <RouterLink :to="docsRoute(showcase)" class="text-link">
                Read command docs <i class="pi pi-arrow-right" aria-hidden="true"></i>
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <ImageDialog
      v-if="expandedShowcase"
      :id="`showcase-dialog-${expandedShowcase.id}`"
      v-model:visible="dialogVisible"
      :title="expandedShowcase.title"
      :description="expandedShowcase.description"
      :src="expandedShowcase.original"
      :alt="expandedShowcase.alt"
    />

    <section class="how-it-works" aria-labelledby="how-title">
      <div class="section-heading">
        <h2 id="how-title">From command to card without leaving Discord.</h2>
      </div>
      <ol class="step-list">
        <li v-for="(step, index) in steps" :key="step.title">
          <span class="step-number" aria-hidden="true">{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <section class="cta" aria-labelledby="cta-title">
      <h2 id="cta-title">Make the next build check a command, not a screenshot hunt.</h2>
      <p>Add MehrakBot, then choose a documented command for the result you need.</p>
      <div class="cta-actions">
        <a
          :href="discordInviteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="primary-action"
        >
          Invite MehrakBot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </a>
        <RouterLink to="/docs?tab=getting-started" class="secondary-action">
          Start with the guide <i class="pi pi-arrow-right" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.home {
  width: min(100% - 2rem, 76rem);
  margin: 0 auto;
}

section {
  padding: clamp(var(--space-12), 7vw, var(--space-20)) 0;
}

section + section {
  border-top: 1px solid var(--divider);
}

.hero {
  display: grid;
  min-height: min(calc(100svh - 4.75rem), 48rem);
  box-sizing: border-box;
  grid-template-columns: minmax(0, 0.9fr) minmax(24rem, 1.25fr);
  align-items: center;
  gap: clamp(var(--space-8), 5vw, var(--space-16));
}

h1,
h2,
h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: var(--leading-tight);
}

h1 {
  max-width: 13ch;
  margin-top: var(--space-3);
  font-size: clamp(2.6rem, 5.5vw, 4.75rem);
}

h2 {
  font-size: clamp(1.9rem, 3vw, var(--text-3xl));
}

h3 {
  font-size: var(--text-2xl);
}

.hero-lede {
  max-width: 35rem;
  margin: var(--space-5) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.hero-actions,
.cta-actions,
.trust-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero-actions {
  margin-top: var(--space-8);
}

.primary-action,
.secondary-action {
  display: inline-flex;
  min-height: var(--control-size);
  padding: 0 var(--space-5);
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: 650;
  text-decoration: none;
  transition:
    background var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard),
    color var(--motion-base) var(--ease-standard);
}

.primary-action {
  border: 1px solid var(--accent-strong);
  background: var(--accent-strong);
  color: var(--accent-contrast);
}

.primary-action:hover {
  background: var(--accent);
}

.secondary-action {
  border: 1px solid var(--border-secondary);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.secondary-action:hover {
  border-color: var(--accent);
  color: var(--accent-strong);
}

.hero-output,
.hero-output img {
  display: block;
  width: 100%;
}

.hero-output img {
  height: auto;
  border-radius: var(--radius-lg);
}

.section-heading {
  max-width: 48rem;
}

.section-heading h2 {
  margin-top: var(--space-3);
}

.section-heading p {
  margin: var(--space-4) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  margin: var(--space-8) 0 0;
  padding: 0;
  gap: var(--space-3);
  list-style: none;
}

.game-list li {
  display: flex;
  min-height: 4.5rem;
  padding: var(--space-3) var(--space-4);
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--game-color) 14%, transparent);
}

.game-list img {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.game-list span {
  font-weight: 650;
}

.showcase-list {
  display: grid;
  margin-top: var(--space-12);
  gap: var(--space-16);
}

.showcase-card {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.65fr);
  align-items: center;
  gap: clamp(var(--space-6), 5vw, var(--space-12));
}

.showcase-card--reverse > :first-child {
  order: 2;
}

.showcase-copy h3 {
  margin-top: var(--space-3);
}

.showcase-copy p {
  margin: var(--space-4) 0 0;
  color: var(--text-secondary);
}

.showcase-actions {
  display: flex;
  margin-top: var(--space-6);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}

code {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--code-bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.text-link {
  display: inline-flex;
  min-height: var(--control-size);
  align-items: center;
  gap: var(--space-2);
  color: var(--accent-strong);
  font-weight: 650;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

.step-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: var(--space-8) 0 0;
  padding: 0;
  gap: var(--space-4);
  list-style: none;
}

.step-list li {
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.step-number {
  display: grid;
  width: var(--control-size);
  height: var(--control-size);
  margin-bottom: var(--space-4);
  place-items: center;
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-weight: 700;
}

.step-list strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.step-list p {
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
}

.cta {
  margin: var(--space-10) 0 var(--space-16);
  padding: clamp(var(--space-10), 7vw, var(--space-16));
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface-raised);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.cta h2 {
  max-width: 22ch;
  margin: var(--space-3) auto 0;
}

.cta p {
  max-width: 38rem;
  margin: var(--space-4) auto var(--space-6);
  color: var(--text-secondary);
}

.cta-actions {
  justify-content: center;
}

@media (max-width: 56rem) {
  .hero,
  .showcase-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero {
    min-height: auto;
  }

  .showcase-card--reverse > :first-child {
    order: 0;
  }

  .showcase-card > .showcase-copy {
    order: -1;
  }
}

@media (max-width: 42rem) {
  .home {
    width: min(100% - 1.5rem, 76rem);
  }

  section {
    padding: var(--space-12) 0;
  }

  h1 {
    font-size: clamp(2.35rem, 13vw, 3.5rem);
  }

  .hero-actions,
  .cta-actions {
    display: grid;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
    box-sizing: border-box;
  }

  .showcase-list {
    gap: var(--space-12);
  }

  .cta {
    padding: var(--space-10) var(--space-5);
  }
}
</style>
