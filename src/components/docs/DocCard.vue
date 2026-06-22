<script setup>
const props = defineProps({
  doc: { type: Object, required: true },
});
const emit = defineEmits(["click"]);
</script>

<template>
  <article class="doc-card" @click="emit('click', doc)">
    <div class="card-top">
      <span class="card-name">{{ doc.name }}</span>
      <span
        class="card-badge"
        :style="{
          color:
            doc.game === 'Genshin'
              ? '#B8860B'
              : doc.game === 'HonkaiStarRail'
                ? '#0077A8'
                : doc.game === 'ZenlessZoneZero'
                  ? '#C45200'
                  : doc.game === 'HonkaiImpact3'
                    ? '#CC3388'
                    : doc.game === 'TearsOfThemis'
                      ? '#8B6B8B'
                      : '#666',
          background:
            doc.game === 'Genshin'
              ? 'rgba(184,134,11,0.12)'
              : doc.game === 'HonkaiStarRail'
                ? 'rgba(0,119,168,0.12)'
                : doc.game === 'ZenlessZoneZero'
                  ? 'rgba(196,82,0,0.12)'
                  : doc.game === 'HonkaiImpact3'
                    ? 'rgba(204,51,136,0.12)'
                    : doc.game === 'TearsOfThemis'
                      ? 'rgba(139,107,139,0.12)'
                      : 'rgba(102,102,102,0.12)',
          borderColor:
            doc.game === 'Genshin'
              ? 'rgba(184,134,11,0.3)'
              : doc.game === 'HonkaiStarRail'
                ? 'rgba(0,119,168,0.3)'
                : doc.game === 'ZenlessZoneZero'
                  ? 'rgba(196,82,0,0.3)'
                  : doc.game === 'HonkaiImpact3'
                    ? 'rgba(204,51,136,0.3)'
                    : doc.game === 'TearsOfThemis'
                      ? 'rgba(139,107,139,0.3)'
                      : 'rgba(102,102,102,0.3)',
        }"
      >
        {{
          doc.game === "HonkaiStarRail"
            ? "HSR"
            : doc.game === "ZenlessZoneZero"
              ? "ZZZ"
              : doc.game === "HonkaiImpact3"
                ? "HI3"
                : doc.game === "TearsOfThemis"
                  ? "ToT"
                  : doc.game === "Genshin"
                    ? "GI"
                    : "Misc"
        }}
      </span>
    </div>
    <p class="card-desc">{{ doc.description }}</p>
    <div class="card-foot">
      <span class="card-link">View details <i class="pi pi-arrow-right"></i></span>
    </div>
  </article>
</template>

<style scoped>
.doc-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.12s ease;
  position: relative;
  overflow: hidden;
}

.doc-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.12s ease;
}

.doc-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.08);
}

.doc-card:hover::before {
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;
}

.card-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.card-badge {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid;
  flex-shrink: 0;
  text-transform: uppercase;
}

.card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
}

.card-foot {
  position: relative;
}

.card-link {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transform: translateX(-0.25rem);
  transition: all 0.12s ease;
}

.doc-card:hover .card-link {
  opacity: 1;
  transform: translateX(0);
}

.card-link i {
  font-size: 0.5rem;
}
</style>
