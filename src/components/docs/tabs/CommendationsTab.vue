<script setup></script>

<template>
  <div class="com">
    <div class="com-hero">
      <div class="com-hero-icon">
        <i class="pi pi-star"></i>
      </div>
      <div>
        <h1 class="com-title">Commendations</h1>
        <p class="com-sub">A special thanks to everyone who made Mehrak possible.</p>
      </div>
    </div>

    <section class="com-card">
      <h2 class="com-card-title">Big thanks to:</h2>

      <div class="com-items">
        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-users"></i></div>
          <div>
            <h3 class="com-item-title">Contributors</h3>
            <p class="com-item-text">GamerYuan</p>
          </div>
        </div>

        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-heart"></i></div>
          <div>
            <h3 class="com-item-title">HoYoverse Developers</h3>
            <p class="com-item-text">For creating fun games for all of us.</p>
          </div>
        </div>

        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-thumbs-up"></i></div>
          <div>
            <h3 class="com-item-title">You!</h3>
            <p class="com-item-text">We couldn't have made it this far without your support.</p>
          </div>
        </div>
      </div>
    </section>

    <p class="com-disclaimer">
      All assets belong to their respective owners. Genshin Impact, Honkai: Star Rail, Zenless Zone
      Zero and Honkai Impact 3rd are registered under the trademarks of Cognosphere Pte., Ltd. and
      miHoYo Co., Ltd. This website and the Discord Bot service is not associated with Cognosphere
      or miHoYo Co., Ltd. in any official capacity.
    </p>
  </div>
</template>

<style scoped>
.com {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.com-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.com-hero-icon {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.com-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.com-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.com-card {
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.com-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
}

.com-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.com-item {
  display: flex;
  gap: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-primary);
}

.com-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.com-item-icon {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  background: rgba(34, 197, 94, 0.08);
  color: var(--accent);
  font-size: 0.875rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.com-item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.com-item-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}

.com-disclaimer {
  font-size: 0.625rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  padding: 0 1rem;
}
</style>
