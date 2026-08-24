<script setup>
import PageHeader from "../../ui/PageHeader.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";
</script>

<template>
  <div class="com">
    <PageHeader
      as="h3"
      icon="pi pi-star"
      title="Commendations"
      subtitle="Credit to the people who keep Mehrak online and improving."
    />

    <SurfaceCard>
      <h4 class="com-card-title">Big thanks to:</h4>

      <div class="com-items">
        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-users"></i></div>
          <div>
            <h5 class="com-item-title">Contributors</h5>
            <p class="com-item-text">GamerYuan</p>
          </div>
        </div>

        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-heart"></i></div>
          <div>
            <h5 class="com-item-title">HoYoverse Developers</h5>
            <p class="com-item-text">For creating fun games for all of us.</p>
          </div>
        </div>

        <div class="com-item">
          <div class="com-item-icon"><i class="pi pi-thumbs-up"></i></div>
          <div>
            <h5 class="com-item-title">You!</h5>
            <p class="com-item-text">We couldn't have made it this far without your support.</p>
          </div>
        </div>
      </div>
    </SurfaceCard>

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
  background: var(--accent-soft);
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
