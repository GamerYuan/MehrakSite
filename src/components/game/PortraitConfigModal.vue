<script setup>
import { ref, watch, computed, onUnmounted } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";
import { useApi } from "../../composables/useApi";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import UserPortraitUploadModal from "./UserPortraitUploadModal.vue";
import { previewConfigs } from "../../configs/gamePreviews/index.js";
import { renderPortrait } from "../../configs/gamePreviews/renderPortrait.js";

const gv = useGameViewInject();
const { apiFetch, showErrorToast, showSuccessToast } = useApi();

const canvasRef = ref(null);
const portraitImage = ref(null);
const portraitBlobUrl = ref(null);
const portraitError = ref(false);
const portraitLoading = ref(false);
const bgLoaded = ref(false);
const portraitLoaded = ref(false);
let renderRaf = 0;

const activeModalTab = ref("default");

const showUploadModal = ref(false);
const uploadLoading = ref(false);

const localOffsetX = ref(0);
const localOffsetY = ref(0);
const zoomLevel = ref(1);
const localFlipX = ref(false);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartOffsetX = ref(0);
const dragStartOffsetY = ref(0);

const revokePortraitBlob = () => {
  if (portraitBlobUrl.value) {
    URL.revokeObjectURL(portraitBlobUrl.value);
    portraitBlobUrl.value = null;
  }
};

const cleanupPortrait = () => {
  revokePortraitBlob();
  portraitImage.value = null;
  portraitError.value = false;
  portraitLoaded.value = false;
};

const previewConfig = computed(() => previewConfigs[gv.config.id] ?? null);

const bgUrl = computed(() => {
  return previewConfig.value?.background ?? "";
});

const serverIdOptions = computed(() =>
  (gv.portraitConfigServerIds || []).map((id) => ({
    label: `ID: ${id}`,
    value: id,
  })),
);

const userPortraitOptions = computed(() =>
  (gv.userPortraits || []).map((p, i) => ({
    label: `Portrait ${i + 1}${p.isActive ? " (active)" : ""} (${new Date(p.createdAt).toLocaleDateString()})`,
    value: p.id,
  })),
);

const remainingSlots = computed(() => gv.MAX_PER_CHARACTER - (gv.userPortraits?.length || 0));

const backgroundImage = ref(null);

const loadBackground = () => {
  if (!bgUrl.value) {
    bgLoaded.value = true;
    backgroundImage.value = null;
    initCanvas();
    renderPreview();
    return;
  }
  backgroundImage.value = new Image();
  backgroundImage.value.onload = () => {
    bgLoaded.value = true;
    initCanvas();
    renderPreview();
  };
  backgroundImage.value.onerror = () => {
    bgLoaded.value = true;
    initCanvas();
    drawBackgroundOnly();
  };
  backgroundImage.value.src = bgUrl.value;
};

const loadDefaultPortrait = async () => {
  if (!gv.config.id || !gv.portraitConfigServerId) return;
  portraitLoading.value = true;
  portraitError.value = false;
  portraitLoaded.value = false;

  try {
    const response = await apiFetch(
      `/portraits/image?game=${encodeURIComponent(gv.config.id)}&serverId=${gv.portraitConfigServerId}`,
    );

    if (response.status === 404) {
      portraitError.value = true;
      showErrorToast(
        `Portrait image for ${gv.portraitConfigCharacter} (ID: ${gv.portraitConfigServerId}) not found, please generate an image with this character in the Characters tab and try again`,
        404,
      );
      return;
    }

    if (!response.ok) {
      portraitError.value = true;
      return;
    }

    revokePortraitBlob();
    const blob = await response.blob();
    portraitBlobUrl.value = URL.createObjectURL(blob);
    portraitImage.value = new Image();
    portraitImage.value.onload = () => {
      portraitLoaded.value = true;
      syncLocalState();
      renderPreview();
    };
    portraitImage.value.onerror = () => {
      portraitError.value = true;
    };
    portraitImage.value.src = portraitBlobUrl.value;
  } catch (err) {
    if (err._redirected) return;
    portraitError.value = true;
  } finally {
    portraitLoading.value = false;
  }
};

const loadUserPortraitImage = async (id) => {
  portraitLoading.value = true;
  portraitError.value = false;
  portraitLoaded.value = false;

  try {
    const response = await apiFetch(`/user-portraits/${id}/image`);
    if (!response.ok) {
      portraitError.value = true;
      return;
    }
    revokePortraitBlob();
    const blob = await response.blob();
    portraitBlobUrl.value = URL.createObjectURL(blob);
    portraitImage.value = new Image();
    portraitImage.value.onload = () => {
      portraitLoaded.value = true;
      syncLocalState();
      renderPreview();
    };
    portraitImage.value.onerror = () => {
      portraitError.value = true;
    };
    portraitImage.value.src = portraitBlobUrl.value;
  } catch (err) {
    if (err._redirected) return;
    portraitError.value = true;
  } finally {
    portraitLoading.value = false;
  }
};

const getDefaultScale = () => {
  if (!portraitImage.value) return 1;
  return gv.config.portraitDefaultWidth
    ? gv.config.portraitDefaultWidth / portraitImage.value.naturalWidth
    : 1;
};

const syncLocalState = () => {
  const isDefault = activeModalTab.value === "default";
  localOffsetX.value = isDefault
    ? (gv.portraitConfigOffsetX ?? 0)
    : (gv.userPortraitConfigOffsetX ?? 0);
  localOffsetY.value = isDefault
    ? (gv.portraitConfigOffsetY ?? 0)
    : (gv.userPortraitConfigOffsetY ?? 0);
  localFlipX.value = isDefault
    ? (gv.portraitConfigFlipX ?? false)
    : (gv.userPortraitConfigFlipX ?? false);
  const targetScale = isDefault ? gv.portraitConfigTargetScale : gv.userPortraitConfigTargetScale;
  const defaultScale = getDefaultScale();
  zoomLevel.value = targetScale && defaultScale ? targetScale / defaultScale : 1;
};

const onCanvasMouseDown = (e) => {
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  dragStartOffsetX.value = localOffsetX.value;
  dragStartOffsetY.value = localOffsetY.value;
  window.addEventListener("mousemove", onCanvasMouseMove);
  window.addEventListener("mouseup", onCanvasMouseUp);
  e.preventDefault();
};

const onCanvasMouseMove = (e) => {
  if (!isDragging.value || !canvasRef.value) return;
  const dx = e.clientX - dragStartX.value;
  const dy = e.clientY - dragStartY.value;
  const scale = canvasRef.value.width / canvasRef.value.clientWidth;
  localOffsetX.value = dragStartOffsetX.value + dx * scale;
  localOffsetY.value = dragStartOffsetY.value + dy * scale;
};

const onCanvasMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", onCanvasMouseMove);
  window.removeEventListener("mouseup", onCanvasMouseUp);
};

const onCanvasWheel = (e) => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  zoomLevel.value = Math.max(0.1, Math.min(5, zoomLevel.value * factor));
};

const resetToDefault = () => {
  localOffsetX.value = 0;
  localOffsetY.value = 0;
  zoomLevel.value = 1;
  localFlipX.value = false;
};

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const pc = previewConfig.value;
  const w = pc?.width ?? backgroundImage.value?.naturalWidth ?? 0;
  const h = pc?.height ?? backgroundImage.value?.naturalHeight ?? 0;
  if (!w || !h) return;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
};

const renderPreview = () => {
  if (!canvasRef.value || !bgLoaded.value || !portraitLoaded.value) return;
  if (!portraitImage.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  const defaultScale = getDefaultScale();
  const scale = defaultScale * zoomLevel.value;
  const portraitW = Math.round(portraitImage.value.naturalWidth * scale);
  const portraitH = Math.round(portraitImage.value.naturalHeight * scale);

  const alignX = gv.config.portraitAlignX ?? 0;
  const alignY = gv.config.portraitAlignY ?? 0;
  const anchorX = gv.config.portraitAnchorX ?? 0.5;
  const anchorY = gv.config.portraitAnchorY ?? 0.5;

  const x = alignX - portraitW * anchorX + localOffsetX.value;
  const y = alignY - portraitH * anchorY + localOffsetY.value;

  const pc = previewConfig.value;
  if (pc?.render) {
    pc.render(ctx, {
      canvas,
      background: backgroundImage.value,
      portrait: portraitImage.value,
      x,
      y,
      w: portraitW,
      h: portraitH,
      flipX: localFlipX.value,
      fadeX: gv.config.fadeX ?? 0,
      fadeWidth: gv.config.fadeWidth ?? 0,
      config: gv.config,
    });
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage.value) {
      ctx.drawImage(backgroundImage.value, 0, 0, canvas.width, canvas.height);
    }
    renderPortrait(ctx, {
      portrait: portraitImage.value,
      x,
      y,
      w: portraitW,
      h: portraitH,
      flipX: localFlipX.value,
      fadeX: 0,
      fadeWidth: 0,
    });
  }
};

const scheduleRender = () => {
  if (renderRaf) cancelAnimationFrame(renderRaf);
  renderRaf = requestAnimationFrame(() => {
    renderRaf = 0;
    renderPreview();
  });
};

watch(
  () => [localOffsetX.value, localOffsetY.value, zoomLevel.value, localFlipX.value],
  scheduleRender,
);

watch(
  () => [
    gv.portraitConfigOffsetX,
    gv.portraitConfigOffsetY,
    gv.portraitConfigTargetScale,
    gv.portraitConfigFlipX,
    gv.userPortraitConfigOffsetX,
    gv.userPortraitConfigOffsetY,
    gv.userPortraitConfigTargetScale,
    gv.userPortraitConfigFlipX,
  ],
  syncLocalState,
);

watch(
  () => gv.portraitConfigServerId,
  (newId, oldId) => {
    if (newId == null) return;
    if (activeModalTab.value !== "default") return;
    cleanupPortrait();
    loadDefaultPortrait();
    if (oldId != null && oldId !== newId) {
      gv.fetchPortraitConfigForServerId(newId);
    }
  },
);

watch(
  () => gv.userPortraitId,
  (newId, oldId) => {
    if (activeModalTab.value !== "user") return;
    cleanupPortrait();
    if (newId == null) {
      drawBackgroundOnly();
      return;
    }
    loadUserPortraitImage(newId);
    if (oldId != null && oldId !== newId) {
      gv.fetchUserPortraitConfig(newId);
    }
  },
);

watch(
  () => gv.showPortraitConfigModal,
  (visible) => {
    if (visible) {
      cleanupPortrait();
      bgLoaded.value = false;
      backgroundImage.value = null;
      loadBackground();
      activeModalTab.value = gv.canManage ? "default" : "user";
      if (gv.portraitConfigCharacter) {
        gv.fetchUserPortraits(gv.portraitConfigCharacter);
      }
    }
  },
);

const drawBackgroundOnly = () => {
  if (!canvasRef.value || !bgLoaded.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage.value) {
    ctx.drawImage(backgroundImage.value, 0, 0, canvas.width, canvas.height);
  } else {
    const pc = previewConfig.value;
    if (pc?.bgColor) {
      ctx.fillStyle = pc.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
};

watch(activeModalTab, (newTab) => {
  cleanupPortrait();
  drawBackgroundOnly();
  if (newTab === "user") {
    if (gv.userPortraitId) {
      loadUserPortraitImage(gv.userPortraitId);
      gv.fetchUserPortraitConfig(gv.userPortraitId);
    }
  } else if (gv.portraitConfigServerId) {
    loadDefaultPortrait();
  }
});

const isDefaultTab = computed(() => activeModalTab.value === "default");
const isUserTab = computed(() => activeModalTab.value === "user");
const isFetching = computed(() => {
  if (activeModalTab.value === "default") {
    return gv.portraitConfigFetching || portraitLoading.value;
  }
  return gv.userPortraitConfigFetching || portraitLoading.value;
});
const isSaving = computed(() => gv.portraitConfigSaving || gv.userPortraitConfigSaving);

const isPortraitActive = computed(() => {
  if (!gv.userPortraitId || !gv.userPortraits) return false;
  const portrait = gv.userPortraits.find((p) => p.id === gv.userPortraitId);
  return portrait?.isActive === true;
});

const onSetActiveUserPortrait = async () => {
  if (!gv.userPortraitId) return;
  try {
    await gv.setActiveUserPortrait(gv.userPortraitId);
  } catch (err) {
    if (err._redirected) return;
    showErrorToast(err.message, err.status);
  }
};
const isSaveDisabled = computed(() => {
  if (activeModalTab.value === "default" && portraitError.value) return true;
  if (activeModalTab.value === "user" && !gv.userPortraitId) return true;
  return false;
});

const onSave = () => {
  const defaultScale = getDefaultScale();
  const computedTargetScale = defaultScale * zoomLevel.value;
  if (activeModalTab.value === "default") {
    gv.portraitConfigOffsetX = localOffsetX.value;
    gv.portraitConfigOffsetY = localOffsetY.value;
    gv.portraitConfigTargetScale = zoomLevel.value === 1 ? null : computedTargetScale;
    gv.portraitConfigFlipX = localFlipX.value;
    gv.handlePortraitConfigSubmit();
  } else {
    gv.userPortraitConfigOffsetX = localOffsetX.value;
    gv.userPortraitConfigOffsetY = localOffsetY.value;
    gv.userPortraitConfigTargetScale = zoomLevel.value === 1 ? null : computedTargetScale;
    gv.userPortraitConfigFlipX = localFlipX.value;
    gv.handleUserPortraitConfigSubmit();
  }
};

const onUpload = async (file) => {
  uploadLoading.value = true;
  try {
    await gv.uploadUserPortrait(gv.portraitConfigCharacter, file);
    await gv.fetchUserPortraits(gv.portraitConfigCharacter);
    showSuccessToast("Portrait uploaded successfully");
    showUploadModal.value = false;
  } catch (err) {
    if (err._redirected) return;
    const data = err.data || {};
    if (err.status === 422) {
      showErrorToast("Potential NSFW image detected", 422);
    } else if (err.status === 429) {
      showErrorToast(`Rate limited. ${data.remaining ?? 0} upload(s) remaining.`, 429);
    } else if (err.status === 502) {
      showErrorToast("Classification service unavailable. Try again later.", 502);
    } else {
      showErrorToast(err.message, err.status);
    }
  } finally {
    uploadLoading.value = false;
  }
};

const onDeleteUserPortrait = async () => {
  if (!gv.userPortraitId) return;
  if (!confirm("Delete this portrait? This cannot be undone.")) return;
  try {
    await gv.deleteUserPortrait(gv.userPortraitId);
    showSuccessToast("Portrait deleted");
    gv.userPortraitId = null;
    cleanupPortrait();
    await gv.fetchUserPortraits(gv.portraitConfigCharacter);
  } catch (err) {
    if (err._redirected) return;
    showErrorToast(err.message, err.status);
  }
};

onUnmounted(() => {
  if (renderRaf) cancelAnimationFrame(renderRaf);
  revokePortraitBlob();
  window.removeEventListener("mousemove", onCanvasMouseMove);
  window.removeEventListener("mouseup", onCanvasMouseUp);
});
</script>

<template>
  <Dialog
    v-model:visible="gv.showPortraitConfigModal"
    modal
    header="Edit Portrait Config"
    :style="{ width: '70rem' }"
    class="portrait-config-dialog"
  >
    <div class="relative">
      <div
        v-if="isFetching"
        class="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/20"
      >
        <i class="pi pi-spin pi-spinner text-xl"></i>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="flex flex-col gap-3 w-full lg:w-90 lg:shrink-0">
          <div class="flex flex-col gap-2">
            <label for="portrait-char">Character</label>
            <input
              id="portrait-char"
              :value="gv.portraitConfigCharacter"
              disabled
              class="w-full rounded border bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm"
            />
          </div>

          <Tabs v-if="gv.canManage" v-model:value="activeModalTab">
            <TabList>
              <Tab value="default">Default Portraits</Tab>
              <Tab value="user">User Portraits</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="default">
                <div class="flex flex-col gap-3">
                  <div
                    v-if="gv.portraitConfigServerIds && gv.portraitConfigServerIds.length > 1"
                    class="flex flex-col gap-2"
                  >
                    <label for="portrait-server-id">Portrait (Server ID)</label>
                    <Select
                      id="portrait-server-id"
                      v-model="gv.portraitConfigServerId"
                      :options="serverIdOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select portrait"
                      fluid
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="localFlipX" binary inputId="portrait-flip-x" />
                    <label for="portrait-flip-x">Flip Horizontal</label>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="user">
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col gap-2">
                    <label for="user-portrait-select">Your Portraits</label>
                    <div class="flex gap-2">
                      <Select
                        id="user-portrait-select"
                        v-model="gv.userPortraitId"
                        :options="userPortraitOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select your portrait"
                        class="w-full lg:w-55"
                        :disabled="!userPortraitOptions.length"
                      />
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        class="shrink-0"
                        :disabled="!gv.userPortraitId"
                        @click="onDeleteUserPortrait"
                      />
                      <Button
                        type="button"
                        icon="pi pi-check"
                        severity="success"
                        outlined
                        class="shrink-0"
                        :disabled="!gv.userPortraitId || isPortraitActive"
                        @click="onSetActiveUserPortrait"
                      />
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span
                        >{{ gv.userPortraits?.length || 0 }} / {{ gv.MAX_PER_CHARACTER }} used</span
                      >
                      <Button
                        type="button"
                        label="Add Image"
                        icon="pi pi-plus"
                        size="small"
                        :disabled="remainingSlots <= 0"
                        @click="showUploadModal = true"
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox v-model="localFlipX" binary inputId="user-portrait-flip-x" />
                    <label for="user-portrait-flip-x">Flip Horizontal</label>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <template v-if="!gv.canManage">
            <div class="flex flex-col gap-2">
              <label for="user-portrait-select-um">Your Portraits</label>
              <div class="flex gap-2">
                <Select
                  id="user-portrait-select-um"
                  v-model="gv.userPortraitId"
                  :options="userPortraitOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select your portrait"
                  fluid
                  :disabled="!userPortraitOptions.length"
                />
                <Button
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  class="shrink-0"
                  :disabled="!gv.userPortraitId"
                  @click="onDeleteUserPortrait"
                />
                <Button
                  type="button"
                  icon="pi pi-check"
                  severity="success"
                  outlined
                  class="shrink-0"
                  :disabled="!gv.userPortraitId || isPortraitActive"
                  @click="onSetActiveUserPortrait"
                />
              </div>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ gv.userPortraits?.length || 0 }} / {{ gv.MAX_PER_CHARACTER }} used</span>
                <Button
                  type="button"
                  label="Add Image"
                  icon="pi pi-plus"
                  size="small"
                  :disabled="remainingSlots <= 0"
                  @click="showUploadModal = true"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox v-model="localFlipX" binary inputId="um-flip-x" />
              <label for="um-flip-x">Flip Horizontal</label>
            </div>
          </template>

          <div class="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              @click="gv.showPortraitConfigModal = false"
            />
            <Button
              type="button"
              label="Save"
              :loading="isSaving"
              :disabled="isSaveDisabled"
              @click="onSave"
            />
          </div>
        </div>

        <div class="flex-1 min-w-0 min-h-0 flex flex-col gap-2 overflow-y-auto">
          <label class="text-sm text-gray-500">Preview</label>
          <div
            class="flex border rounded overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-[55vh] items-center justify-center"
          >
            <canvas
              ref="canvasRef"
              class="max-w-full max-h-full object-contain"
              :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
              @mousedown="onCanvasMouseDown"
              @wheel="onCanvasWheel"
            />
          </div>
          <div class="flex items-center gap-2">
            <Button
              type="button"
              label="Reset"
              icon="pi pi-refresh"
              severity="secondary"
              size="small"
              outlined
              @click="resetToDefault"
            />
            <span class="text-xs text-gray-400">Drag to move, scroll to zoom</span>
          </div>
          <div v-if="portraitError" class="text-sm text-red-500 text-center italic">
            Portrait image not available
          </div>
        </div>
      </div>
    </div>

    <UserPortraitUploadModal
      v-model:visible="showUploadModal"
      :character="gv.portraitConfigCharacter"
      :remainingSlots="remainingSlots"
      :loading="uploadLoading"
      @submit="onUpload"
    />
  </Dialog>
</template>

<style scoped>
:deep(.portrait-config-dialog .p-dialog-content) {
  max-height: calc(70vh - 4rem);
  overflow-y: auto;
}

@media (max-width: 768px) {
  :deep(.portrait-config-dialog .p-dialog) {
    width: calc(100vw - 1rem) !important;
    max-height: 95vh;
    margin: 0.5rem;
  }

  :deep(.portrait-config-dialog .p-dialog-content) {
    max-height: calc(95vh - 4rem);
    overflow-y: auto;
  }
}
</style>
