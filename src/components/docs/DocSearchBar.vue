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
  <div class="search-bar">
    <div class="search-wrap">
      <i class="pi pi-search search-icon"></i>
      <input
        type="text"
        :value="searchQuery"
        @input="emit('update:searchQuery', $event.target.value)"
        placeholder="Search commands..."
        class="search-input"
      />
    </div>
    <div class="filters">
      <div class="filter-pills">
        <button
          v-for="game in gameFilters"
          :key="game.key"
          :class="['pill', { active: isGameSelected(game.key) }]"
          @click="emit('toggleGame', game.key)"
        >
          <span class="pill-dot" :style="{ background: game.color }"></span>
          {{ game.label }}
        </button>
      </div>
      <button v-if="!allSelected" class="select-all" @click="emit('selectAllGames')">
        Select all
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.875rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.08);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.1s ease;
}

.pill:hover {
  border-color: var(--border-secondary);
  color: var(--text-secondary);
}

.pill.active {
  background: var(--bg-surface);
  border-color: var(--border-secondary);
  color: var(--text-primary);
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
  padding: 0.25rem 0;
  font-family: inherit;
  opacity: 0.8;
  transition: opacity 0.1s ease;
}

.select-all:hover {
  opacity: 1;
}
</style>
