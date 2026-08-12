<script setup>
import { onUnmounted, ref, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";

const props = defineProps({
  visible: { type: Boolean, required: true },
  character: { type: String, required: true },
  remainingSlots: { type: Number, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "submit"]);

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 3000;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const NSFW_THRESHOLD = 0.7;

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const fileError = ref("");
const nsfwError = ref("");
const modelLoading = ref(false);
const classifying = ref(false);
let nsfwModel = null;
let fileChangeToken = 0;

const allowedTypesLabel = ALLOWED_TYPES.map((t) => (t === "image/jpeg" ? "JPG" : "PNG")).join(", ");

const revokePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
};

const resetState = () => {
  revokePreview();
  selectedFile.value = null;
  fileError.value = "";
  nsfwError.value = "";
  classifying.value = false;
  if (fileInput.value) fileInput.value.value = "";
};

const handleVisibleUpdate = (value) => {
  emit("update:visible", value);
  if (!value) resetState();
};

const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    }, { once: true });
    img.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image dimensions"));
    }, { once: true });
    img.src = url;
  });

const loadNsfwModel = async () => {
  if (nsfwModel) return nsfwModel;
  modelLoading.value = true;
  try {
    const nsfwjs = await import("nsfwjs");
    nsfwModel = await nsfwjs.load();
  } catch (error) {
    nsfwModel = null;
    throw error;
  } finally {
    modelLoading.value = false;
  }
  return nsfwModel;
};

const classifyImage = async (file) => {
  const model = await loadNsfwModel();
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", () => reject(new Error("Failed to load image for classification")), { once: true });
      img.src = url;
    });
    const predictions = await model.classify(img);
    const risky = predictions
      .filter((p) => ["Porn", "Hentai", "Sexy"].includes(p.className))
      .reduce((sum, p) => sum + p.probability, 0);
    return risky;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const onFileChange = async (event) => {
  const file = event.target.files?.[0];
  const myToken = ++fileChangeToken;
  fileError.value = "";
  nsfwError.value = "";
  revokePreview();
  selectedFile.value = null;

  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    fileError.value = `Invalid file type. Only ${allowedTypesLabel} are allowed.`;
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    fileError.value = `File is too large. Maximum size is 8MB.`;
    return;
  }

  let dims = null;
  try {
    dims = await getImageDimensions(file);
  } catch {
    if (myToken !== fileChangeToken) return;
    fileError.value = "Could not read image dimensions.";
    return;
  }
  if (myToken !== fileChangeToken) return;
  if (dims.width > MAX_DIMENSION || dims.height > MAX_DIMENSION) {
    fileError.value = `Image dimensions exceed ${MAX_DIMENSION}x${MAX_DIMENSION}px (${dims.width}x${dims.height}).`;
    return;
  }

  const myPreviewUrl = URL.createObjectURL(file);
  previewUrl.value = myPreviewUrl;
  selectedFile.value = file;

  classifying.value = true;
  try {
    const score = await classifyImage(file);
    if (myToken !== fileChangeToken) return;
    if (score >= NSFW_THRESHOLD) {
      nsfwError.value = "Potential NSFW image detected";
      URL.revokeObjectURL(myPreviewUrl);
      if (previewUrl.value === myPreviewUrl) previewUrl.value = null;
      if (selectedFile.value === file) selectedFile.value = null;
    }
  } catch (error) {
    if (myToken !== fileChangeToken) return;
    nsfwError.value = `Could not verify image content: ${error.message || "Unknown error"}. Please try again.`;
  } finally {
    if (myToken === fileChangeToken) {
      classifying.value = false;
    }
  }
};

const onSubmit = () => {
  if (!selectedFile.value || fileError.value || nsfwError.value) return;
  emit("submit", selectedFile.value);
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) resetState();
  },
);

onUnmounted(() => {
  revokePreview();
});
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="handleVisibleUpdate"
    modal
    header="Upload Portrait"
    :style="{ width: 'min(32rem, calc(100vw - 2rem))' }"
    class="portrait-upload-dialog"
  >
    <div class="relative">
      <div
        v-if="props.loading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/30"
      >
        <i class="pi pi-spin pi-spinner text-2xl text-white"></i>
      </div>

      <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Uploading portrait for
          <strong>{{ props.character }}</strong>
          ({{ props.remainingSlots }} slot{{ props.remainingSlots === 1 ? "" : "s" }}
          remaining)
        </p>

        <Message severity="info" :closable="false">
          <div class="text-sm">
            <div><strong>Requirements:</strong></div>
            <ul class="list-disc pl-5 mt-1 space-y-0.5">
              <li>Formats: {{ allowedTypesLabel }}</li>
              <li>Max size: 8MB</li>
              <li>Max dimensions: {{ MAX_DIMENSION }}x{{ MAX_DIMENSION }}px</li>
              <li>NSFW content will be rejected</li>
            </ul>
          </div>
        </Message>

        <div class="flex flex-col gap-2">
          <label for="portrait-file">Image file</label>
          <input
            id="portrait-file"
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png"
            :disabled="props.loading || modelLoading"
            @change="onFileChange"
            class="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-200 dark:file:bg-gray-700 file:text-sm file:font-medium cursor-pointer disabled:opacity-50"
          />
        </div>

        <div
          v-if="previewUrl"
          class="border rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex justify-center"
        >
          <img :src="previewUrl" alt="Preview" class="max-h-64" />
        </div>

        <div>
          <Message v-if="fileError" severity="error" :closable="false">
            {{ fileError }}
          </Message>
          <Message v-else-if="nsfwError" severity="error" :closable="false">
            {{ nsfwError }}
          </Message>
          <Message v-else-if="modelLoading" severity="warn" :closable="false">
            Loading NSFW classifier model...
          </Message>
        </div>

        <div class="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            :disabled="props.loading"
            @click="handleVisibleUpdate(false)"
          />
          <Button
            type="button"
            label="Submit"
            :loading="props.loading"
            :disabled="!selectedFile || !!fileError || !!nsfwError || props.loading || classifying"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.portrait-upload-dialog) {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

:deep(.portrait-upload-dialog .p-dialog-header) {
  border-bottom: 1px solid var(--border-primary);
}
</style>
