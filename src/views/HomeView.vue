<script setup>
import HeroShowcase from "../components/HeroShowcase.vue";
import ShowcaseSection from "../components/ShowcaseSection.vue";
import { discordInviteUrl, githubUrl } from "../configs/publicLinks";
import { gameConfigs } from "../configs/gameConfigs";

const heroImages = [
  {
    src: "/showcase/builds-1.webp",
    alt: "Generated Genshin Impact build card for Nahida with equipment and character stats",
  },
  {
    src: "/showcase/endgame-3.webp",
    alt: "Generated Honkai: Star Rail Memory of Chaos clear record",
  },
  {
    src: "/showcase/list-2.webp",
    alt: "Generated character roster summary card",
  },
];

const games = Object.values(gameConfigs).map(({ routeKey, logo, label }, index) => ({
  routeKey,
  logo,
  label,
  index: String(index + 1).padStart(2, "0"),
}));

const showcases = [
  {
    index: "01",
    title: "Build records, ready to share",
    description:
      "Turn character, weapon, equipment, talent, and stat data into a single visual record made for Discord.",
    images: [
      "/showcase/builds-1.webp",
      "/showcase/builds-2.webp",
      "/showcase/builds-3.webp",
      "/showcase/builds-4.webp",
    ],
  },
  {
    index: "02",
    title: "A roster at a glance",
    description:
      "Collect character levels, progression, and key equipment into a compact overview of your account.",
    images: ["/showcase/list-1.webp", "/showcase/list-2.webp", "/showcase/list-3.webp"],
    reversed: true,
  },
  {
    index: "03",
    title: "Endgame runs, kept in context",
    description:
      "Generate clear records with teams and results for supported endgame modes, without leaving Discord.",
    images: [
      "/showcase/endgame-1.webp",
      "/showcase/endgame-2.webp",
      "/showcase/endgame-3.webp",
      "/showcase/endgame-4.webp",
    ],
  },
];
</script>

<template>
  <article class="home">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">ORBITAL FIELD NOTE · MEHRAK / 01</p>
        <h1 id="home-title">Your game records, observed from Discord.</h1>
        <p class="hero-lede">
          MehrakBot turns HoYoverse account data into clear, shareable build, roster, and endgame
          cards—right where your community already gathers.
        </p>
        <div class="hero-actions">
          <a
            :href="discordInviteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="primary-action"
          >
            Add MehrakBot <span aria-hidden="true">↗</span>
          </a>
          <RouterLink to="/docs" class="text-action">Read the field guide →</RouterLink>
        </div>
        <dl class="hero-notes">
          <div>
            <dt>Signal</dt>
            <dd>Discord commands</dd>
          </div>
          <div>
            <dt>Output</dt>
            <dd>Generated game cards</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>Open source</dd>
          </div>
        </dl>
      </div>
      <HeroShowcase :images="heroImages" />
    </section>

    <section class="game-index" aria-labelledby="games-title">
      <div class="section-heading">
        <span>SUPPORTED OBSERVATORIES</span>
        <h2 id="games-title">Four worlds. One field station.</h2>
      </div>
      <ol class="game-list">
        <li v-for="game in games" :key="game.routeKey">
          <span class="game-number">{{ game.index }}</span>
          <img :src="game.logo" alt="" />
          <strong>{{ game.label }}</strong>
          <span class="game-status">Command suite active</span>
        </li>
      </ol>
    </section>

    <section id="features" class="capabilities" aria-labelledby="capabilities-title">
      <div class="capability-intro">
        <span class="eyebrow">CAPABILITY LOG</span>
        <h2 id="capabilities-title">From live account data to a record worth keeping.</h2>
        <p>
          MehrakBot brings the recurring work—looking up builds, surveying a roster, checking an
          endgame run—into repeatable Discord commands and visual outputs.
        </p>
      </div>
      <div class="capability-steps" aria-label="How MehrakBot works">
        <div>
          <span>01</span><strong>Request</strong>
          <p>Run a supported command in Discord.</p>
        </div>
        <div>
          <span>02</span><strong>Observe</strong>
          <p>MehrakBot retrieves the relevant game data.</p>
        </div>
        <div>
          <span>03</span><strong>Record</strong>
          <p>Receive a generated card ready to share.</p>
        </div>
      </div>
    </section>

    <section class="gallery" aria-labelledby="gallery-title">
      <div class="gallery-heading">
        <span class="eyebrow">COLLECTED SPECIMENS</span>
        <h2 id="gallery-title">Designed around the details players look for.</h2>
      </div>
      <ShowcaseSection v-for="item in showcases" :key="item.index" v-bind="item" />
    </section>

    <section class="trust" aria-labelledby="trust-title">
      <div>
        <span class="eyebrow">OPEN INSTRUMENTS</span>
        <h2 id="trust-title">Inspect the source. Keep control of your profile.</h2>
      </div>
      <div class="trust-copy">
        <p>
          MehrakBot is GPL-3.0 licensed and its source is available on GitHub. Profile management
          and documentation are available through this site; account access uses Discord login.
        </p>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer">Review the source ↗</a>
        <RouterLink to="/privacy">Read the privacy policy →</RouterLink>
      </div>
    </section>

    <section class="cta" aria-labelledby="cta-title">
      <span class="cta-mark" aria-hidden="true">✦</span>
      <div>
        <span class="eyebrow">ESTABLISH CONTACT</span>
        <h2 id="cta-title">Bring the field station to your server.</h2>
      </div>
      <a :href="discordInviteUrl" target="_blank" rel="noopener noreferrer" class="primary-action">
        Invite MehrakBot <span aria-hidden="true">↗</span>
      </a>
    </section>
  </article>
</template>

<style scoped>
.home {
  width: min(100% - 2rem, 90rem);
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.2fr);
  min-height: calc(100svh - 4.75rem);
  align-items: center;
  gap: clamp(var(--space-10), 6vw, var(--space-20));
  padding: clamp(var(--space-12), 8vw, var(--space-24)) 0;
}

.hero-copy {
  position: relative;
  z-index: 1;
  animation: arrive var(--motion-slow) var(--ease-enter) both;
}

.eyebrow,
.section-heading > span {
  color: var(--brass);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.12em;
}

h1 {
  max-width: 11ch;
  margin: var(--space-4) 0 var(--space-6);
  font-size: var(--text-4xl);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: var(--leading-tight);
}

.hero-lede {
  max-width: 35rem;
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.hero-actions {
  display: flex;
  margin-top: var(--space-8);
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-5);
}

.primary-action {
  display: inline-flex;
  min-height: 3rem;
  padding: 0 var(--space-5);
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border: 1px solid var(--accent-strong);
  border-radius: var(--radius-sm);
  background: var(--accent-strong);
  color: var(--accent-contrast);
  font-weight: 600;
  text-decoration: none;
}

.primary-action:hover {
  background: var(--accent);
}

.text-action,
.trust-copy a {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration-color: var(--border-secondary);
  text-underline-offset: 0.35em;
}

.hero-notes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: var(--space-10) 0 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-primary);
  gap: var(--space-3);
}

.hero-notes div {
  display: grid;
  gap: var(--space-1);
}

.hero-notes dt,
.game-number {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-notes dd {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

.game-index,
.capabilities,
.trust,
.cta {
  border-top: 1px solid var(--border-secondary);
}

.game-index {
  display: grid;
  grid-template-columns: minmax(14rem, 0.8fr) minmax(0, 1.5fr);
  gap: clamp(var(--space-8), 7vw, var(--space-20));
  padding: var(--space-16) 0;
}

.section-heading h2,
.capability-intro h2,
.gallery-heading h2,
.trust h2,
.cta h2 {
  margin: var(--space-3) 0 0;
  font-size: clamp(var(--text-2xl), 4.5vw, 3.6rem);
  font-weight: 600;
  line-height: var(--leading-snug);
}

.game-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.game-list li {
  display: grid;
  grid-template-columns: 2rem 2.5rem minmax(8rem, 1fr) auto;
  min-height: 4.5rem;
  align-items: center;
  gap: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}

.game-list li:first-child {
  border-top: 1px solid var(--border-primary);
}

.game-list img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.game-list strong {
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.game-status {
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.capabilities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(var(--space-8), 8vw, var(--space-24));
  padding: var(--space-20) 0;
}

.capability-intro p,
.trust-copy > p {
  max-width: 38rem;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.capability-steps {
  display: grid;
  align-content: center;
}

.capability-steps > div {
  display: grid;
  grid-template-columns: 2.5rem 7rem 1fr;
  padding: var(--space-5) 0;
  align-items: baseline;
  border-bottom: 1px solid var(--border-primary);
  gap: var(--space-3);
}

.capability-steps span {
  color: var(--brass);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.capability-steps p {
  margin: 0;
  color: var(--text-muted);
}

.gallery {
  padding-top: var(--space-16);
}

.gallery-heading {
  display: grid;
  grid-template-columns: minmax(10rem, 0.7fr) minmax(0, 1.3fr);
  align-items: end;
}

.gallery-heading h2 {
  max-width: 15ch;
}

.trust {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(var(--space-8), 8vw, var(--space-24));
  padding: var(--space-20) 0;
}

.trust-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.trust-copy > p {
  margin: 0 0 var(--space-2);
}

.cta {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  min-height: 20rem;
  padding: var(--space-20) 0;
  align-items: center;
  gap: var(--space-10);
}

.cta h2 {
  max-width: 15ch;
}

.cta-mark {
  position: absolute;
  right: 12%;
  color: var(--brass);
  font-size: 14rem;
  line-height: 1;
  opacity: 0.08;
  pointer-events: none;
}

@keyframes arrive {
  from {
    opacity: 0;
    translate: -2rem 0;
  }
}

@media (max-width: 56rem) {
  .hero,
  .game-index,
  .capabilities,
  .trust {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero {
    padding-top: var(--space-16);
  }

  .gallery-heading {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 40rem) {
  .home {
    width: min(100% - 1.5rem, 90rem);
  }

  .hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-notes,
  .cta {
    grid-template-columns: 1fr;
  }

  .hero-notes {
    gap: var(--space-3);
  }

  .game-list li {
    grid-template-columns: 1.5rem 2.5rem minmax(0, 1fr);
  }

  .game-status {
    display: none;
  }

  .capability-steps > div {
    grid-template-columns: 2rem 1fr;
  }

  .capability-steps p {
    grid-column: 2;
  }

  .cta {
    align-items: start;
  }
}
</style>
