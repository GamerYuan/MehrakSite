<script setup>
import { RouterView } from "vue-router";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import LogoutStatus from "./components/LogoutStatus.vue";
import { useTheme } from "./composables/useTheme";

useTheme();
</script>

<template>
  <LogoutStatus />
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>
