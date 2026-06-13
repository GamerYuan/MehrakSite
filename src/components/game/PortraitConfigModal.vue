<script setup>
import { ref, watch, computed, onUnmounted } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";
import { useApi } from "../../composables/useApi";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import UserPortraitUploadModal from "./UserPortraitUploadModal.vue";

const gv = useGameViewInject();
const { apiFetch, showErrorToast, showSuccessToast } = useApi();

const canvasRef = ref(null);
const portraitImage = ref(null);
const portraitBlobUrl = ref(null);
const portraitError = ref(false);
const portraitLoading = ref(false);
const bgLoaded = ref(false);
const portraitLoaded = ref(false);
let renderTimeout;

const activeModalTab = ref("default");

const showUploadModal = ref(false);
const uploadLoading = ref(false);

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

const bgFileByGameId = {
  Genshin: "genshin_portrait_bg.webp",
  HonkaiImpact3: "hi3_portrait_bg.webp",
  HonkaiStarRail: "hsr_portrait_bg.webp",
  ZenlessZoneZero: "zzz_portrait_bg.webp",
};

const bgUrl = computed(() => {
  const file = bgFileByGameId[gv.config.id];
  return file ? `/${file}` : "";
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

const remainingSlots = computed(
  () => gv.MAX_PER_CHARACTER - (gv.userPortraits?.length || 0),
);

const backgroundImage = ref(null);

const loadBackground = () => {
  if (!bgUrl.value) return;
  backgroundImage.value = new Image();
  backgroundImage.value.onload = () => {
    bgLoaded.value = true;
    renderPreview();
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
      renderPreview();
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
      renderPreview();
    };
    portraitImage.value.src = portraitBlobUrl.value;
  } catch (err) {
    if (err._redirected) return;
    portraitError.value = true;
  } finally {
    portraitLoading.value = false;
  }
};

const renderPreview = () => {
  if (!canvasRef.value || !bgLoaded.value || !portraitLoaded.value) return;
  if (!backgroundImage.value || !portraitImage.value) return;

  const canvas = canvasRef.value;
  const bg = backgroundImage.value;
  const portrait = portraitImage.value;

  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0);

  const cfg =
    activeModalTab.value === "user"
      ? {
          offsetX: gv.userPortraitConfigOffsetX,
          offsetY: gv.userPortraitConfigOffsetY,
          targetScale: gv.userPortraitConfigTargetScale,
          enableFade: gv.userPortraitConfigEnableFade,
          fadeStart: gv.userPortraitConfigFadeStart,
        }
      : {
          offsetX: gv.portraitConfigOffsetX,
          offsetY: gv.portraitConfigOffsetY,
          targetScale: gv.portraitConfigTargetScale,
          enableFade: gv.portraitConfigEnableFade,
          fadeStart: gv.portraitConfigFadeStart,
        };

  const scale =
    cfg.targetScale ??
    (gv.config.portraitDefaultWidth
      ? gv.config.portraitDefaultWidth / portrait.naturalWidth
      : 1);
  const portraitW = Math.round(portrait.naturalWidth * scale);
  const portraitH = Math.round(portrait.naturalHeight * scale);

  const alignX = gv.config.portraitAlignX ?? 0;
  const alignY = gv.config.portraitAlignY ?? 0;
  const anchorX = gv.config.portraitAnchorX ?? 0.5;
  const anchorY = gv.config.portraitAnchorY ?? 0.5;
  const offsetX = cfg.offsetX ?? 0;
  const offsetY = cfg.offsetY ?? 0;

  const x = alignX - portraitW * anchorX + offsetX;
  const y = alignY - portraitH * anchorY + offsetY;

  if (cfg.enableFade) {
    const fadeCanvas = document.createElement("canvas");
    fadeCanvas.width = portraitW;
    fadeCanvas.height = portraitH;
    const fadeCtx = fadeCanvas.getContext("2d", { willReadFrequently: true });
    fadeCtx.drawImage(portrait, 0, 0, portraitW, portraitH);

    const imageData = fadeCtx.getImageData(0, 0, portraitW, portraitH);
    const data = imageData.data;
    const fadeStartRatio = cfg.fadeStart ?? 0.75;
    const fadeStartX = Math.floor(portraitW * fadeStartRatio);
    const fadeWidth = portraitW - fadeStartX;

    if (fadeWidth > 0) {
      for (let px = fadeStartX; px < portraitW; px++) {
        const t = (px - fadeStartX) / fadeWidth;
        const alpha = 1.0 - t;
        const fadeAlpha = Math.pow(alpha, 5);
        const clampedFade = Math.max(0, Math.min(1, fadeAlpha));
        for (let py = 0; py < portraitH; py++) {
          const idx = (py * portraitW + px) * 4 + 3;
          data[idx] = Math.round(data[idx] * clampedFade);
        }
      }
    }

    fadeCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(fadeCanvas, x, y);
  } else {
    ctx.drawImage(portrait, x, y, portraitW, portraitH);
  }
};

const scheduleRender = () => {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderPreview, 50);
};

watch(
  () => [
    gv.portraitConfigOffsetX,
    gv.portraitConfigOffsetY,
    gv.portraitConfigTargetScale,
    gv.portraitConfigEnableFade,
    gv.portraitConfigFadeStart,
    gv.userPortraitConfigOffsetX,
    gv.userPortraitConfigOffsetY,
    gv.userPortraitConfigTargetScale,
    gv.userPortraitConfigEnableFade,
    gv.userPortraitConfigFadeStart,
  ],
  scheduleRender,
);

watch(
  () => gv.portraitConfigServerId,
  (newId, oldId) => {
    if (newId == null) return;
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
  if (!canvasRef.value || !bgLoaded.value || !backgroundImage.value) return;
  const canvas = canvasRef.value;
  const bg = backgroundImage.value;
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0);
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
const isSaving = computed(
  () => gv.portraitConfigSaving || gv.userPortraitConfigSaving,
);

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
  if (activeModalTab.value === "default") {
    gv.handlePortraitConfigSubmit();
  } else {
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
      showErrorToast(
        `NSFW content detected (confidence ${data.confidence ?? "N/A"}). Upload rejected.`,
        422,
      );
    } else if (err.status === 429) {
      showErrorToast(
        `Rate limited. ${data.remaining ?? 0} upload(s) remaining.`,
        429,
      );
    } else if (err.status === 502) {
      showErrorToast(
        "Classification service unavailable. Try again later.",
        502,
      );
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
  clearTimeout(renderTimeout);
  revokePortraitBlob();
});
</script>

<template>
  <Dialog
    v-model:visible="gv.showPortraitConfigModal"
    modal
    header="Edit Portrait Config"
    :style="{ width: '80rem' }"
  >
    <div class="relative">
      <div
        v-if="isFetching"
        class="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/20"
      >
        <i class="pi pi-spin pi-spinner text-xl"></i>
      </div>

      <div class="flex gap-6">
        <div class="flex flex-col gap-3 w-90 shrink-0">
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
                    v-if="
                      gv.portraitConfigServerIds &&
                      gv.portraitConfigServerIds.length > 1
                    "
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
                  <div class="flex flex-col gap-2">
                    <label for="portrait-offset-x">Offset X (px)</label>
                    <InputNumber
                      id="portrait-offset-x"
                      v-model="gv.portraitConfigOffsetX"
                      :minFractionDigits="0"
                      fluid
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="portrait-offset-y">Offset Y (px)</label>
                    <InputNumber
                      id="portrait-offset-y"
                      v-model="gv.portraitConfigOffsetY"
                      :minFractionDigits="0"
                      fluid
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="portrait-scale"
                      >Target Scale<span
                        v-if="gv.config.portraitDefaultWidth"
                        class="text-xs text-gray-400"
                      >
                        (defaults to {{ gv.config.portraitDefaultWidth }}px
                        width)</span
                      ></label
                    >
                    <InputNumber
                      id="portrait-scale"
                      v-model="gv.portraitConfigTargetScale"
                      :minFractionDigits="2"
                      :maxFractionDigits="4"
                      placeholder="e.g. 1.0"
                      fluid
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox
                      v-model="gv.portraitConfigEnableFade"
                      binary
                      inputId="portrait-fade"
                    />
                    <label for="portrait-fade">Enable Gradient Fade</label>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="portrait-fade-start">Gradient Fade Start</label>
                    <InputNumber
                      id="portrait-fade-start"
                      v-model="gv.portraitConfigFadeStart"
                      :minFractionDigits="2"
                      :maxFractionDigits="2"
                      :min="0"
                      :max="1"
                      fluid
                    />
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
                        class="w-55"
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
                    <div
                      class="flex items-center justify-between text-xs text-gray-500"
                    >
                      <span
                        >{{ gv.userPortraits?.length || 0 }} /
                        {{ gv.MAX_PER_CHARACTER }} used</span
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
                  <div class="flex flex-col gap-2">
                    <label for="user-portrait-offset-x">Offset X (px)</label>
                    <InputNumber
                      id="user-portrait-offset-x"
                      v-model="gv.userPortraitConfigOffsetX"
                      :minFractionDigits="0"
                      fluid
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="user-portrait-offset-y">Offset Y (px)</label>
                    <InputNumber
                      id="user-portrait-offset-y"
                      v-model="gv.userPortraitConfigOffsetY"
                      :minFractionDigits="0"
                      fluid
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="user-portrait-scale"
                      >Target Scale<span
                        v-if="gv.config.portraitDefaultWidth"
                        class="text-xs text-gray-400"
                      >
                        (defaults to {{ gv.config.portraitDefaultWidth }}px
                        width)</span
                      ></label
                    >
                    <InputNumber
                      id="user-portrait-scale"
                      v-model="gv.userPortraitConfigTargetScale"
                      :minFractionDigits="2"
                      :maxFractionDigits="4"
                      placeholder="e.g. 1.0"
                      fluid
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox
                      v-model="gv.userPortraitConfigEnableFade"
                      binary
                      inputId="user-portrait-fade"
                    />
                    <label for="user-portrait-fade">Enable Gradient Fade</label>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="user-portrait-fade-start"
                      >Gradient Fade Start</label
                    >
                    <InputNumber
                      id="user-portrait-fade-start"
                      v-model="gv.userPortraitConfigFadeStart"
                      :minFractionDigits="2"
                      :maxFractionDigits="2"
                      :min="0"
                      :max="1"
                      fluid
                    />
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
              <div
                class="flex items-center justify-between text-xs text-gray-500"
              >
                <span
                  >{{ gv.userPortraits?.length || 0 }} /
                  {{ gv.MAX_PER_CHARACTER }} used</span
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
            <div class="flex flex-col gap-2">
              <label for="um-offset-x">Offset X (px)</label>
              <InputNumber
                id="um-offset-x"
                v-model="gv.userPortraitConfigOffsetX"
                :minFractionDigits="0"
                fluid
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="um-offset-y">Offset Y (px)</label>
              <InputNumber
                id="um-offset-y"
                v-model="gv.userPortraitConfigOffsetY"
                :minFractionDigits="0"
                fluid
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="um-scale"
                >Target Scale<span
                  v-if="gv.config.portraitDefaultWidth"
                  class="text-xs text-gray-400"
                >
                  (defaults to {{ gv.config.portraitDefaultWidth }}px
                  width)</span
                ></label
              >
              <InputNumber
                id="um-scale"
                v-model="gv.userPortraitConfigTargetScale"
                :minFractionDigits="2"
                :maxFractionDigits="4"
                placeholder="e.g. 1.0"
                fluid
              />
            </div>
            <div class="flex items-center gap-2">
              <Checkbox
                v-model="gv.userPortraitConfigEnableFade"
                binary
                inputId="um-fade"
              />
              <label for="um-fade">Enable Gradient Fade</label>
            </div>
            <div class="flex flex-col gap-2">
              <label for="um-fade-start">Gradient Fade Start</label>
              <InputNumber
                id="um-fade-start"
                v-model="gv.userPortraitConfigFadeStart"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="0"
                :max="1"
                fluid
              />
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

        <div class="flex-1 min-w-0 flex flex-col gap-2">
          <label class="text-sm text-gray-500">Preview</label>
          <div
            class="border rounded overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <canvas ref="canvasRef" class="w-full h-auto" />
          </div>
          <div
            v-if="portraitError"
            class="text-sm text-red-500 text-center italic"
          >
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
