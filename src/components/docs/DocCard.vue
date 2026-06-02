<script setup>
import GameTag from "./GameTag.vue";
import Card from "primevue/card";

const props = defineProps({
  doc: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <Card
    class="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:-translate-y-0.5"
    @click="emit('click', doc)"
  >
    <template #content>
      <div class="flex justify-between items-start gap-3 mb-3">
        <h3 class="m-0 text-base font-semibold text-zinc-900 dark:text-white break-words">
          {{ doc.name }}
        </h3>
        <GameTag :game="doc.game" size="small" />
      </div>
      <p class="m-0 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
        {{ doc.description }}
      </p>
    </template>
  </Card>
</template>
