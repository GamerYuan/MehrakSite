<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import ImageCompare from "primevue/imagecompare";
import Message from "primevue/message";
import Popover from "primevue/popover";
import Select from "primevue/select";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import { onBeforeUnmount, ref } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";
import { RARITIES, WEAPON_TYPES } from "../../composables/game/useWeaponIcons";

const gv = useGameViewInject();

// Filter popover
const filterMenu = ref(null);
const toggleFilter = (event) => filterMenu.value?.toggle(event);

// Compare dialog state
const showCompare = ref(false);

// Upload modal state
const showUploadModal = ref(false);
const uploadTab = ref("0");
const selectedFile = ref(null);
const filePreviewUrl = ref(null);
const processedBlobUrl = ref(null);
const processing = ref(false);
const uploading = ref(false);

// Ponytail: temp processed result shown in main view before server upload
const tempProcessedUrl = ref(null);
const tempProcessedFile = ref(null);

const weaponTypeLabel = (id) => {
  const digit2 = Math.floor(id / 1000) % 10;
  const type = WEAPON_TYPES.find((t) => t.value === digit2);
  return type?.label || "Unknown";
};

const weaponRarity = (id) => Math.floor(id / 100) % 10;

const formatWeaponOption = (w) => `${w.id} (${weaponTypeLabel(w.id)} ${weaponRarity(w.id)}★)`;

const onFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  if (filePreviewUrl.value) URL.revokeObjectURL(filePreviewUrl.value);
  filePreviewUrl.value = URL.createObjectURL(file);
  if (processedBlobUrl.value) URL.revokeObjectURL(processedBlobUrl.value);
  processedBlobUrl.value = null;
};

const handleProcess = async () => {
  if (!selectedFile.value || !gv.selectedWeaponId) return;
  processing.value = true;
  const blobUrl = await gv.processWeaponImage(gv.selectedWeaponId, selectedFile.value);
  processing.value = false;
  if (!blobUrl) return;

  // Convert blob URL to File for later upload
  const resp = await fetch(blobUrl);
  const blob = await resp.blob();
  const file = new globalThis.File([blob], `weapon_ascended_${gv.selectedWeaponId}.png`, { type: "image/png" });

  // Set temp state and close modal
  if (tempProcessedUrl.value) URL.revokeObjectURL(tempProcessedUrl.value);
  tempProcessedUrl.value = blobUrl;
  tempProcessedFile.value = file;
  showUploadModal.value = false;
};

const handleTempUpload = async () => {
  if (!gv.selectedWeaponId || !tempProcessedFile.value) return;
  uploading.value = true;
  await gv.confirmUploadWeaponIcon(`weapon_ascended_${gv.selectedWeaponId}.png`, tempProcessedFile.value);
  uploading.value = false;
  clearTempProcessed();
};

const clearTempProcessed = () => {
  if (tempProcessedUrl.value) URL.revokeObjectURL(tempProcessedUrl.value);
  tempProcessedUrl.value = null;
  tempProcessedFile.value = null;
};

const handleUpload = async (file) => {
  if (!gv.selectedWeaponId || !file) return;
  uploading.value = true;
  const ok = await gv.confirmUploadWeaponIcon(`weapon_ascended_${gv.selectedWeaponId}.png`, file);
  uploading.value = false;
  if (ok) showUploadModal.value = false;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
  if (filePreviewUrl.value) URL.revokeObjectURL(filePreviewUrl.value);
  filePreviewUrl.value = null;
  if (processedBlobUrl.value) URL.revokeObjectURL(processedBlobUrl.value);
  processedBlobUrl.value = null;
  processing.value = false;
  uploading.value = false;
  uploadTab.value = "0";
};

// Clear temp when weapon selection changes
const onWeaponChange = () => {
  clearTempProcessed();
};

onBeforeUnmount(() => {
  if (filePreviewUrl.value) URL.revokeObjectURL(filePreviewUrl.value);
  if (processedBlobUrl.value) URL.revokeObjectURL(processedBlobUrl.value);
  if (tempProcessedUrl.value) URL.revokeObjectURL(tempProcessedUrl.value);
});
</script>

<template>
  <Card class="game-card">
    <template #title>Manage Weapon Icons</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Selector row -->
        <div class="flex gap-2">
          <Select
            v-model="gv.selectedWeaponId"
            :options="gv.filteredWeapons"
            :optionLabel="formatWeaponOption"
            optionValue="id"
            placeholder="Select a weapon"
            filter
            fluid
            @update:model-value="onWeaponChange"
          />
          <Button
            icon="pi pi-sliders-h"
            severity="secondary"
            outlined
            @click="toggleFilter"
            aria-label="Filters"
          />
        </div>

        <!-- Image display -->
        <div v-if="gv.selectedWeaponId" class="flex flex-col items-center gap-4">
          <div class="flex gap-4">
            <!-- Base icon -->
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="gv.hasBase"
                :src="gv.baseImageUrl"
                class="rounded border object-contain"
                width="200"
                height="200"
                alt="Base weapon icon"
              />
              <div
                v-else
                class="w-[200px] h-[200px] rounded border flex items-center justify-center text-(--text-secondary) text-sm"
              >
                No base icon
              </div>
              <span class="text-sm text-(--text-secondary)">Base</span>
            </div>

            <!-- Ascended icon -->
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="tempProcessedUrl || gv.hasAscended"
                :src="tempProcessedUrl || gv.ascendedImageUrl"
                class="rounded border object-contain"
                :class="tempProcessedUrl && 'ring-2 ring-amber-400'"
                width="200"
                height="200"
                alt="Ascended weapon icon"
              />
              <div
                v-else
                class="w-[200px] h-[200px] rounded border flex items-center justify-center"
              >
                <Button
                  label="Upload Source"
                  severity="info"
                  size="small"
                  @click="showUploadModal = true"
                />
              </div>
              <span class="text-sm text-(--text-secondary)">
                Ascended{{ tempProcessedUrl ? " (preview)" : "" }}
              </span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2">
            <Button
              v-if="gv.hasBase && (gv.hasAscended || tempProcessedUrl)"
              label="Compare"
              severity="secondary"
              icon="pi pi-arrows-h"
              @click="showCompare = true"
            />
            <Button
              v-if="tempProcessedFile"
              label="Upload"
              icon="pi pi-upload"
              :loading="uploading"
              :disabled="uploading"
              @click="handleTempUpload"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>

  <!-- Filter Popover -->
  <Popover ref="filterMenu">
    <div class="flex flex-col gap-4 p-2 min-w-[14rem]">
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Weapon Type</span>
        <div v-for="wt in WEAPON_TYPES" :key="wt.value" class="flex items-center gap-2">
          <Checkbox v-model="gv.selectedTypes" :inputId="`wt-${wt.value}`" :value="wt.value" />
          <label :for="`wt-${wt.value}`" class="text-sm">{{ wt.label }}</label>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Rarity</span>
        <div v-for="r in RARITIES" :key="r" class="flex items-center gap-2">
          <Checkbox v-model="gv.selectedRarities" :inputId="`r-${r}`" :value="r" />
          <label :for="`r-${r}`" class="text-sm">{{ r }}★</label>
        </div>
      </div>
      <div class="flex items-center gap-2 border-t pt-2">
        <Checkbox v-model="gv.showOnlyMissingAscended" inputId="missing-ascended" binary />
        <label for="missing-ascended" class="text-sm">Missing ascended only</label>
      </div>
    </div>
  </Popover>

  <!-- Compare Dialog -->
  <Dialog v-model:visible="showCompare" modal header="Compare Icons" :style="{ width: '28rem' }">
    <div class="flex justify-center">
      <ImageCompare class="w-[200px] h-[200px]">
        <template #left>
          <img :src="gv.baseImageUrl" alt="Base" />
        </template>
        <template #right>
          <img :src="tempProcessedUrl || gv.ascendedImageUrl" alt="Ascended" />
        </template>
      </ImageCompare>
    </div>
  </Dialog>

  <!-- Upload Modal -->
  <Dialog
    v-model:visible="showUploadModal"
    modal
    header="Upload Weapon Icon"
    :style="{ width: '32rem' }"
    @after-hide="closeUploadModal"
  >
    <div class="relative">
      <div
        v-if="processing || uploading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/30"
      >
        <i class="pi pi-spin pi-spinner text-2xl text-white"></i>
      </div>

      <Tabs v-model:value="uploadTab">
        <TabList>
          <Tab value="0">Process via Pipeline</Tab>
          <Tab value="1">Upload Processed</Tab>
        </TabList>
        <TabPanels>
          <!-- Tab 1: Process via Pipeline -->
          <TabPanel value="0">
            <div class="flex flex-col gap-4">
              <Message severity="info" :closable="false">
                <div class="text-sm">
                  Upload an unprocessed ascended image. The pipeline will align and crop it to
                  200x200 using the base icon as reference.
                </div>
              </Message>

              <div class="flex flex-col gap-2">
                <label for="weapon-file-process">Source image</label>
                <input
                  id="weapon-file-process"
                  type="file"
                  accept="image/png"
                  :disabled="processing"
                  @change="onFileSelect"
                  class="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-200 dark:file:bg-gray-700 file:text-sm file:font-medium cursor-pointer disabled:opacity-50"
                />
              </div>

              <!-- Large preview -->
              <div
                v-if="filePreviewUrl || processedBlobUrl"
                class="border rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex justify-center"
              >
                <img
                  :src="processedBlobUrl || filePreviewUrl"
                  alt="Preview"
                  class="max-h-64"
                />
              </div>

              <div class="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  label="Cancel"
                  severity="secondary"
                  :disabled="processing"
                  @click="showUploadModal = false"
                />
                <Button
                  v-if="!processedBlobUrl"
                  label="Process"
                  :disabled="!selectedFile || processing"
                  :loading="processing"
                  @click="handleProcess"
                />
                <Button
                  v-else
                  label="Upload"
                  :loading="uploading"
                  :disabled="uploading"
                  @click="handleUpload(selectedFile)"
                />
              </div>
            </div>
          </TabPanel>

          <!-- Tab 2: Upload Processed -->
          <TabPanel value="1">
            <div class="flex flex-col gap-4">
              <Message severity="info" :closable="false">
                <div class="text-sm">
                  Upload an already-processed 200x200 PNG ascended icon directly.
                </div>
              </Message>

              <div class="flex flex-col gap-2">
                <label for="weapon-file-direct">Processed image</label>
                <input
                  id="weapon-file-direct"
                  type="file"
                  accept="image/png"
                  :disabled="uploading"
                  @change="onFileSelect"
                  class="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-200 dark:file:bg-gray-700 file:text-sm file:font-medium cursor-pointer disabled:opacity-50"
                />
              </div>

              <!-- Large preview -->
              <div
                v-if="filePreviewUrl"
                class="border rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex justify-center"
              >
                <img :src="filePreviewUrl" alt="Preview" class="max-h-64" />
              </div>

              <div class="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  label="Cancel"
                  severity="secondary"
                  :disabled="uploading"
                  @click="showUploadModal = false"
                />
                <Button
                  label="Upload"
                  :disabled="!selectedFile || uploading"
                  :loading="uploading"
                  @click="handleUpload(selectedFile)"
                />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </Dialog>
</template>

<style scoped>
/* ponytail: override PrimeVue theme's width:100% on ImageCompare */
:deep(.p-imagecompare) {
  width: 200px !important;
}
</style>
