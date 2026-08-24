<script setup>
import { computed } from "vue";
import { gameMeta } from "../../configs/gameMeta";

const props = defineProps({
  searchQuery: String,
  selectedGames: Array,
});

const emit = defineEmits(["update:searchQuery", "toggleGame", "selectAllGames"]);

const gameFilters = Object.entries(gameMeta).map(([key, meta]) => ({
  key,
  label: meta.shortLabel || meta.label,
  color: meta.color,
}));

const isGameSelected = (game) => props.selectedGames.includes(game);
const allSelected = computed(() => props.selectedGames.length === gameFilters.length);
</script>

<template>
  <form class="search-bar" role="search" @submit.prevent>
    <div class="search-wrap">
      <label for="command-search">Search the command catalogue</label>
      <i class="pi pi-search search-icon" aria-hidden="true"></i>
      <input
        id="command-search"
        type="text"
        :value="searchQuery"
        @input="emit('update:searchQuery', $event.target.value)"
        placeholder="Try “build”, “profile”, or “abyss”…"
        class="search-input"
        autocomplete="off"
      />
    </div>
    <fieldset class="filters">
      <legend>Filter by game</legend>
      <div class="filter-pills">
        <button
          v-for="game in gameFilters"
          :key="game.key"
          type="button"
          :class="['pill', { active: isGameSelected(game.key) }]"
          :aria-pressed="isGameSelected(game.key)"
          @click="emit('toggleGame', game.key)"
        >
          <span class="pill-dot" :style="{ background: game.color }"></span>
          {{ game.label }}
        </button>
      </div>
      <button v-if="!allSelected" type="button" class="select-all" @click="emit('selectAllGames')">
        Select all
      </button>
    </fieldset>
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--card-surface);
}

.search-wrap {
  position: relative;
}

.search-wrap label,
.filters legend {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  bottom: 0.9rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.8rem 0.875rem 0.8rem 2.5rem;
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--motion-fast) var(--ease-standard);
}

.search-input:focus-visible {
  border-color: var(--accent);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-primary);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition:
    background var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard);
}

.pill:hover {
  border-color: var(--border-secondary);
  color: var(--text-secondary);
}

.pill.active {
  background: var(--accent-soft);
  border-color: var(--border-secondary);
  color: var(--accent-strong);
}

.pill-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.select-all {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem 0;
  font-family: inherit;
  opacity: 0.8;
  transition: opacity 0.1s ease;
}

.select-all:hover {
  opacity: 1;
}

@media (max-width: 40rem) {
  .search-bar {
    padding: var(--space-4);
  }
}
</style>
