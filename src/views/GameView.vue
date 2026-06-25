<script setup>
import { provide, reactive } from "vue";
import { GAME_VIEW_KEY } from "../composables/game/injectKey";
import GameViewContainer from "../components/game/GameViewContainer.vue";
import { gameConfigs } from "../configs/gameConfigs";
import { useGameView } from "../composables/useGameView";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const config = gameConfigs[route.params.game];
if (config) {
  const gameView = reactive(useGameView(config));
  provide(GAME_VIEW_KEY, gameView);
} else {
  router.replace({ name: "dashboard-home" });
}
</script>

<template>
  <GameViewContainer />
</template>
