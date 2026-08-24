<script setup>
import PageHeader from "../../ui/PageHeader.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";
</script>

<template>
  <div class="about">
    <PageHeader
      as="h3"
      icon="pi pi-heart"
      title="About Mehrak"
      subtitle="One command center for your HoYoverse games."
    />

    <SurfaceCard>
      <p class="about-lead">
        Mehrak is committed to provide the best user experience to all our users through convenient
        commands and powerful utilities.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="about-card-title">Why Mehrak?</h4>

      <div class="feature-grid">
        <div class="feature">
          <div class="feature-icon-wrap"><i class="pi pi-user"></i></div>
          <div>
            <h5 class="feature-title">User-First Approach</h5>
            <p class="feature-desc">
              Users are our main concern when developing Mehrak. The development thus far has been
              based on user feedback. We are committed to improve our services through user feedback
              and suggestions.
            </p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon-wrap"><i class="pi pi-shield"></i></div>
          <div>
            <h5 class="feature-title">Security</h5>
            <p class="feature-desc">
              Mehrak is one of the only few HoYoverse games Discord bots that offers zero-knowledge
              encryption and security for your cookies information. Your information is safe with
              us.
            </p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon-wrap"><i class="pi pi-dollar"></i></div>
          <div>
            <h5 class="feature-title">Free</h5>
            <p class="feature-desc">
              All Mehrak services are provided for free. We are committed to keeping all our
              services free in the future, with no paywalls or premium benefits.
            </p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon-wrap"><i class="pi pi-star"></i></div>
          <div>
            <h5 class="feature-title">Features</h5>
            <p class="feature-desc">
              Our vision is to be the most fully featured HoYoverse games Discord bot that covers
              all HoYoverse titles. You can be part of our journey by using Mehrak services.
            </p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon-wrap"><i class="pi pi-code"></i></div>
          <div>
            <h5 class="feature-title">Open Source</h5>
            <p class="feature-desc">
              Mehrak is fully open-source. This allows you to see how your data is being used. You
              may audit the source code at any given time and voice your concerns.
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="about-card-title">Self-Hosting</h4>
      <p class="about-text">
        We will not provide any instructions to self-host Mehrak. However, with the source code
        available, with enough technical expertise you can technically self-host Mehrak if you wish
        to. You must comply to our
        <a
          href="https://github.com/GamerYuan/MehrakBot/blob/master/LICENSE.txt"
          target="_blank"
          rel="noopener noreferrer"
          class="about-link"
          >license</a
        >
        to self-host.
      </p>
      <p class="about-text">
        Self-hosted Mehrak instances have no affiliation with the official Mehrak Bot. The Mehrak
        developers do not have control over what modifications have been made with self-hosted
        Mehrak instances.
      </p>
    </SurfaceCard>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-lead {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.about-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
}

.about-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 0.75rem 0;
}

.about-text:last-child {
  margin-bottom: 0;
}

.about-link {
  color: var(--accent);
  text-decoration: none;
}

.about-link:hover {
  color: var(--accent-strong);
}

.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature {
  display: flex;
  gap: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-primary);
}

.feature:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.feature-icon-wrap {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.875rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.feature-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.feature-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}
</style>
