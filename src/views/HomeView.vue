<script setup>
import { nextTick, ref, watch } from "vue";
import { discordInviteUrl, githubUrl } from "../configs/publicLinks";
import { gameConfigs } from "../configs/gameConfigs";

const games = Object.values(gameConfigs).filter((game) => game.routeKey);

const features = [
  {
    title: "Build card",
    description:
      "Character, weapon, equipment, talents, and stats rendered into one image made for sharing in Discord.",
    image: "/showcase/builds-2.webp",
    alt: "Generated Genshin Impact build card with equipment and stats",
    layout: "wide",
    fit: "cover",
  },
  {
    title: "Roster summaries",
    description: "Character levels, progression, and key equipment in a compact account overview.",
    image: "/showcase/list-1.webp",
    alt: "Generated character roster summary card",
    layout: "wide",
    fit: "height",
  },
  {
    title: "Endgame records",
    description: "Clear records with teams and results for supported endgame modes.",
    image: "/showcase/endgame-2.webp",
    alt: "Generated endgame clear record card",
    layout: "tall",
    fit: "width",
  },
];

const expandedFeature = ref(null);
const activeFeatureButton = ref(null);
const closeButton = ref(null);

const openFeature = (feature, event) => {
  activeFeatureButton.value = event.currentTarget;
  expandedFeature.value = feature;
};

const closeFeature = () => {
  expandedFeature.value = null;
  nextTick(() => activeFeatureButton.value?.focus());
};

watch(expandedFeature, async (feature) => {
  if (!feature) return;
  await nextTick();
  closeButton.value?.focus();
});

const steps = [
  { title: "Run a command", text: "Pick a command like /build or /abyss in Discord." },
  { title: "MehrakBot fetches your data", text: "It pulls the relevant records from your account." },
  { title: "Get a card", text: "A finished image is posted back, ready to share." },
];
</script>

<template>
  <article class="home">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <h1 id="home-title">HoYoverse game cards, straight from Discord.</h1>
        <p class="hero-lede">
          MehrakBot turns your game data into clean, shareable cards — builds, rosters, and endgame
          records — without leaving your server.
        </p>
        <div class="hero-actions">
          <a
            :href="discordInviteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="primary-action"
          >
            Invite bot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
          </a>
          <RouterLink to="/docs" class="secondary-action">
            Browse commands <i class="pi pi-arrow-right" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>
      <figure class="hero-figure">
        <img
          src="/showcase/builds-1.webp"
          alt="Generated Genshin Impact build card for Nahida with equipment and stats"
        />
      </figure>
    </section>

    <section class="games" aria-labelledby="games-title">
      <h2 id="games-title">Supported games</h2>
      <ul class="game-list">
        <li v-for="game in games" :key="game.routeKey" :style="game.gameColorStyle">
          <img :src="game.logo" alt="" />
          <span>{{ game.label }}</span>
        </li>
      </ul>
    </section>

    <section id="features" class="features" aria-labelledby="features-title">
      <h2 id="features-title">What MehrakBot can do</h2>
      <div class="feature-grid">
        <button
          v-for="feature in features"
          :key="feature.title"
          type="button"
          class="feature-module"
          :class="[`feature-module--${feature.layout}`, `feature-module--fit-${feature.fit}`]"
          :aria-label="`Expand ${feature.title} image`"
          @click="openFeature(feature, $event)"
        >
          <img :src="feature.image" :alt="feature.alt" loading="lazy" />
          <span class="feature-module__caption">
            <strong>{{ feature.title }}</strong>
            <span>{{ feature.description }}</span>
            <span class="feature-module__expand">
              View full image <i class="pi pi-expand" aria-hidden="true"></i>
            </span>
          </span>
        </button>
      </div>
    </section>

    <Transition name="feature-lightbox">
      <div
        v-if="expandedFeature"
        class="feature-lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expanded-feature-title"
        @keydown.esc.window="closeFeature"
      >
        <button
          type="button"
          class="feature-lightbox__backdrop"
          aria-label="Close expanded image"
          @click="closeFeature"
        ></button>
        <div class="feature-lightbox__panel">
          <header class="feature-lightbox__header">
            <div>
              <span class="surface-kicker">Feature preview</span>
              <h3 id="expanded-feature-title">{{ expandedFeature.title }}</h3>
            </div>
            <button
              ref="closeButton"
              type="button"
              class="feature-lightbox__close"
              aria-label="Close expanded image"
              @click="closeFeature"
            >
              <i class="pi pi-times" aria-hidden="true"></i>
            </button>
          </header>
          <img
            class="feature-lightbox__image"
            :src="expandedFeature.image"
            :alt="expandedFeature.alt"
          />
          <p>{{ expandedFeature.description }}</p>
        </div>
      </div>
    </Transition>

    <section class="how-it-works" aria-labelledby="how-title">
      <h2 id="how-title">How it works</h2>
      <ol class="step-list">
        <li v-for="(step, index) in steps" :key="step.title">
          <span class="step-number" aria-hidden="true">{{ index + 1 }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <section class="cta" aria-labelledby="cta-title">
      <h2 id="cta-title">Add MehrakBot to your Discord server.</h2>
      <p>Free and open source (GPL-3.0).</p>
      <div class="cta-actions">
        <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer" class="primary-action">
          Invite bot <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </a>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="secondary-action">
          View source <i class="pi pi-github" aria-hidden="true"></i>
        </a>
      </div>
    </section>
  </article>
</template>

<style scoped>
.home {
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 1fr);
  min-height: min(calc(100svh - 4.75rem), 42rem);
  align-items: center;
  gap: clamp(var(--space-8), 5vw, var(--space-16));
  padding: clamp(var(--space-12), 7vw, var(--space-20)) 0;
  box-sizing: border-box;
}

h1 {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.hero-lede {
  max-width: 32rem;
  margin: var(--space-5) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.hero-actions,
.cta-actions {
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
  min-height: 2.75rem;
  padding: 0 var(--space-5);
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  transition:
    background var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard);
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
}

.hero-figure {
  position: relative;
  margin: 0;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
}

.hero-figure::before {
  position: absolute;
  inset: -10%;
  z-index: 0;
  content: "";
  background: radial-gradient(closest-side, color-mix(in oklch, var(--accent) 22%, transparent), transparent 72%);
}

.hero-figure img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  border-radius: calc(var(--radius-lg) - 1px);
}

/* Section scaffolding */
section {
  padding: var(--space-12) 0;
}

section + section {
  border-top: 1px solid var(--border-primary);
}

h2 {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Games */
.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  margin: var(--space-6) 0 0;
  padding: 0;
  gap: var(--space-3);
  list-style: none;
}

.game-list li {
  display: flex;
  min-height: 4rem;
  padding: var(--space-3) var(--space-4);
  align-items: center;
  gap: var(--space-3);
  border: 1px solid color-mix(in oklch, var(--game-color) 38%, var(--border-primary));
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--game-color) 7%, var(--bg-surface));
  box-shadow: inset 3px 0 var(--game-color);
  transition:
    background var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

.game-list li:hover {
  background: color-mix(in oklch, var(--game-color) 12%, var(--bg-surface));
  transform: translateY(-1px);
}

.game-list img {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.game-list span {
  font-weight: 600;
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(16rem, 0.85fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  height: clamp(36rem, 54vw, 46rem);
  margin-top: var(--space-6);
  gap: var(--space-4);
}

.feature-module {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  color: var(--text-primary);
  text-align: left;
  cursor: zoom-in;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

.feature-module--tall {
  grid-column: 2;
  grid-row: 1 / -1;
}

.feature-module:hover,
.feature-module:focus-visible {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-0.15rem);
}

.feature-module img {
  display: block;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  height: auto;
  padding: 0;
  object-fit: contain;
  background: var(--bg-surface-sunken);
  transition: transform var(--motion-slow) var(--ease-enter);
}

.feature-module--fit-cover img {
  object-fit: cover;
}

.feature-module--fit-height img {
  width: auto;
  max-width: 100%;
  align-self: center;
}

.feature-module--fit-width img {
  flex: 0 0 auto;
  height: auto;
  object-fit: initial;
}

.feature-module:hover img,
.feature-module:focus-visible img {
  transform: scale(1.025);
}

.feature-module__caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-8) var(--space-5) var(--space-5);
  background: linear-gradient(180deg, transparent, var(--bg-overlay) 42%);
}

.feature-module__caption strong {
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.feature-module__caption > span:not(.feature-module__expand) {
  max-width: 42rem;
  color: var(--text-primary);
}

.feature-module__expand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.feature-lightbox {
  position: fixed;
  z-index: 110;
  top: calc(4.75rem + var(--space-2));
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  padding: var(--space-6);
  place-items: center;
  background: var(--bg-overlay);
  overflow: auto;
}

.feature-lightbox__backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  border: 0;
  background: transparent;
  cursor: zoom-out;
}

.feature-lightbox__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 68rem);
  max-height: calc(100svh - 4.75rem - var(--space-2) - var(--space-8) - var(--space-4));
  overflow: auto;
  padding: var(--space-4);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-dialog);
}

.feature-lightbox__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-2) var(--space-4);
}

.feature-lightbox__header h3 {
  margin: var(--space-1) 0 0;
  font-size: var(--text-xl);
}

.feature-lightbox__close {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  cursor: pointer;
}

.feature-lightbox__close:hover {
  border-color: var(--accent);
}

.feature-lightbox__image {
  display: block;
  width: 100%;
  max-height: calc(100svh - 13rem);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-sunken);
  object-fit: contain;
}

.feature-lightbox__panel p {
  margin: var(--space-4) var(--space-2) var(--space-2);
  color: var(--text-secondary);
}

.feature-lightbox-enter-active,
.feature-lightbox-leave-active {
  transition: opacity var(--motion-base) var(--ease-standard);
}

.feature-lightbox-enter-from,
.feature-lightbox-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .feature-module,
  .feature-module img,
  .feature-lightbox-enter-active,
  .feature-lightbox-leave-active {
    transition: none;
  }
}

/* How it works */
.step-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: var(--space-6) 0 0;
  padding: 0;
  gap: var(--space-4);
  list-style: none;
  counter-reset: step;
}

.step-list li {
  padding: var(--space-5);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.step-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  margin-bottom: var(--space-3);
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 700;
}

.step-list p {
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
}

/* CTA */
.cta {
  margin-bottom: var(--space-16);
  padding: var(--space-12) var(--space-6);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  text-align: center;
}

.cta p {
  margin: var(--space-3) 0 var(--space-6);
  color: var(--text-secondary);
}

.cta-actions {
  justify-content: center;
}

@media (max-width: 56rem) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-figure {
    max-width: 30rem;
  }

  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    height: auto;
  }

  .feature-module {
    min-height: 17rem;
  }

  .feature-module--tall {
    grid-column: auto;
    grid-row: auto;
    min-height: 32rem;
  }

  .step-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
