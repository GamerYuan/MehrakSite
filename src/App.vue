<script setup>
import { RouterView } from "vue-router";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { useTheme } from "./composables/useTheme";

useTheme();
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>
