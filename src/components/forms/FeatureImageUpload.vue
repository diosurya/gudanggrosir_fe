<template>
  <UiParentCard :title="title">
    <template v-if="loading">
      <SkeletonLoader type="card" :rows="3" />
    </template>
    <template v-else>
      <v-row>
        <!-- Switch Banner On/Off -->
        <v-col cols="12" class="mb-3">
          <div class="d-flex align-items-center gap-3">
            <v-switch 
              v-model="bannerEnabled" 
              :label="bannerEnabled ? 'Banner Aktif' : 'Banner Nonaktif'"
              color="primary"
              hide-details
              @update:model-value="onBannerToggle"
            />
            <v-chip 
              :color="bannerEnabled ? 'success' : 'default'" 
              size="small"
              variant="outlined"
            >
              {{ bannerEnabled ? 'ON' : 'OFF' }}
            </v-chip>
          </div>
        </v-col>

        <!-- Form Upload (hanya tampil jika banner aktif) -->
        <v-col v-if="bannerEnabled" cols="12">
          <div class="flex flex-col items-center gap-4">
            <!-- Preview Image -->
            <div v-if="previewSrc" class="relative">
              <img
                :src="previewSrc"
                :alt="imageAlt || 'Preview Image'"
                class="previewSrc"
                :style="previewStyle"
              />
              <v-chip 
                class="absolute top-2 right-2" 
                color="success" 
                size="small"
              >
                {{ hasExistingImage ? 'Current Image' : 'New Upload' }}
              </v-chip>
            </div>
            
            <!-- No Image Placeholder -->
            <div 
              v-else 
              class="w-full max-w-64 h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300"
            >
              <div class="text-center">
                <v-icon icon="mdi-image-outline" size="48" class="text-gray-400 mb-2" />
                <span class="text-gray-500 text-sm">{{ placeholder || 'No image selected' }}</span>
              </div>
            </div>
            
            <!-- File Input -->
            <div class="w-full max-w-md">
              <v-file-input
                v-model="selectedFile"
                :label="inputLabel || 'Choose Image'"
                accept="image/*"
                prepend-icon="mdi-camera"
                variant="outlined"
                density="compact"
                :rules="fileRules"
                @change="handleImageUpload"
                :disabled="uploading"
              />
              
              <!-- Additional Info -->
              <div class="text-xs text-gray-500 mt-1">
                {{ acceptedFormats || 'Supported: JPG, PNG, GIF, WebP (Max: 2MB)' }}
              </div>
            </div>

            <!-- Image Alt Text -->
            <div v-if="previewSrc" class="w-full max-w-md">
              <v-text-field
                v-model="imageAlt"
                label="Alt Text (untuk SEO)"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Deskripsi singkat gambar"
              />
            </div>
            
            <!-- Action Buttons -->
            <div v-if="previewSrc || selectedFile" class="flex gap-2">
              <v-btn 
                v-if="selectedFile && !uploading"
                color="primary" 
                @click="uploadImage"
                :disabled="!selectedFile"
                size="small"
              >
                <v-icon icon="mdi-upload" class="me-1" />
                Upload Image
              </v-btn>
              
              <v-btn 
                v-if="previewSrc" 
                color="error" 
                size="small" 
                @click="resetImage"
                variant="outlined"
                :disabled="uploading"
              >
                <v-icon icon="mdi-delete" class="me-1" />
                Remove Image
              </v-btn>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploading" class="w-full max-w-md">
              <v-progress-linear 
                :model-value="uploadProgress" 
                color="primary" 
                height="6"
                rounded
              />
              <p class="text-sm text-gray-600 text-center mt-1">Uploading... {{ uploadProgress }}%</p>
            </div>
          </div>
        </v-col>

        <!-- Info ketika banner off -->
        <v-col v-else cols="12">
          <v-alert 
            type="info" 
            variant="outlined" 
            class="text-center"
          >
            <v-icon icon="mdi-information-outline" class="me-2" />
            Banner dinonaktifkan. Aktifkan switch di atas untuk mengelola gambar banner.
          </v-alert>
        </v-col>
      </v-row>
    </template>
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  title?: string
  modelValue?: {
    enabled: boolean
    imageUrl: string | null
    altText: string
  }
  loading?: boolean
  placeholder?: string
  inputLabel?: string
  acceptedFormats?: string
  maxFileSize?: number // dalam MB
  previewStyle?: string
  uploadEndpoint?: string
}

interface Emits {
  (e: 'update:modelValue', value: {
    enabled: boolean
    imageUrl: string | null
    altText: string
  }): void
  (e: 'upload', file: File): void
  (e: 'remove'): void
  (e: 'toggle', enabled: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Feature Image',
  loading: false,
  placeholder: 'No image selected',
  inputLabel: 'Choose Image',
  acceptedFormats: 'Supported: JPG, PNG, GIF, WebP (Max: 2MB)',
  maxFileSize: 2,
  previewStyle: 'max-width: 400px; max-height: 200px; object-fit: cover; border-radius: 8px;'
})

const emit = defineEmits<Emits>()

// Local state
const selectedFile = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)

// Computed properties
const bannerEnabled = computed({
  get: () => props.modelValue?.enabled || false,
  set: (val) => {
    const newValue = {
      enabled: val,
      imageUrl: val ? props.modelValue?.imageUrl || null : null,
      altText: val ? props.modelValue?.altText || '' : ''
    }
    emit('update:modelValue', newValue)
  }
})

const previewSrc = computed(() => {
  if (selectedFile.value.length > 0) {
    return URL.createObjectURL(selectedFile.value[0])
  }
  return props.modelValue?.imageUrl || null
})

const imageAlt = computed({
  get: () => props.modelValue?.altText || '',
  set: (val) => {
    const newValue = {
      enabled: bannerEnabled.value,
      imageUrl: props.modelValue?.imageUrl || null,
      altText: val
    }
    emit('update:modelValue', newValue)
  }
})

const hasExistingImage = computed(() => {
  return props.modelValue?.imageUrl && selectedFile.value.length === 0
})

// Validation rules
const fileRules = computed(() => [
  (files: File[]) => {
    if (!files || files.length === 0) return true
    const file = files[0]
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File harus berupa gambar'
    }
    
    // Check file size
    if (file.size > props.maxFileSize * 1024 * 1024) {
      return `Ukuran file maksimal ${props.maxFileSize}MB`
    }
    
    return true
  }
])

// Methods
const handleImageUpload = (event: Event) => {
  const files = selectedFile.value
  if (files && files.length > 0) {
    const file = files[0]
    
    // Validate file
    const validation = fileRules.value[0](files)
    if (validation !== true) {
      alert(validation)
      selectedFile.value = []
      return
    }

    // Auto upload jika ada endpoint
    if (props.uploadEndpoint) {
      uploadImage()
    }
  }
}

const uploadImage = async () => {
  if (!selectedFile.value.length) return
  
  const file = selectedFile.value[0]
  uploading.value = true
  uploadProgress.value = 0

  try {
    // Simulate upload progress (ganti dengan actual upload logic)
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(interval)
      }
    }, 200)

    // Emit upload event untuk parent component handle
    emit('upload', file)

    // Update model value dengan temporary URL untuk preview
    const imageUrl = URL.createObjectURL(file)
    const newValue = {
      enabled: bannerEnabled.value,
      imageUrl: imageUrl,
      altText: imageAlt.value
    }
    emit('update:modelValue', newValue)

    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
      selectedFile.value = []
    }, 2000)

  } catch (error) {
    console.error('Upload failed:', error)
    uploading.value = false
    uploadProgress.value = 0
    alert('Upload gagal, silakan coba lagi')
  }
}

const resetImage = () => {
  selectedFile.value = []
  const newValue = {
    enabled: bannerEnabled.value,
    imageUrl: null,
    altText: ''
  }
  emit('update:modelValue', newValue)
  emit('remove')
}

const onBannerToggle = (enabled: boolean) => {
  emit('toggle', enabled)
  if (!enabled) {
    // Reset image ketika banner dinonaktifkan
    resetImage()
  }
}

// Cleanup object URLs when component unmounts
watch(() => selectedFile.value, (newFiles, oldFiles) => {
  if (oldFiles) {
    oldFiles.forEach(file => {
      if (file instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(file))
      }
    })
  }
})
</script>

<style scoped>
.previewSrc {
  v-bind: previewStyle;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.previewSrc:hover {
  transform: scale(1.02);
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.top-2 {
  top: 8px;
}

.right-2 {
  right: 8px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.w-full {
  width: 100%;
}

.max-w-64 {
  max-width: 256px;
}

.max-w-md {
  max-width: 448px;
}

.h-40 {
  height: 160px;
}

.bg-gray-100 {
  background-color: #f5f5f5;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-red-500 {
  color: #ef4444;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-medium {
  font-weight: 500;
}

.rounded-xl {
  border-radius: 12px;
}

.border-2 {
  border-width: 2px;
}

.border-dashed {
  border-style: dashed;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.block {
  display: block;
}

.text-center {
  text-align: center;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-1 {
  margin-top: 4px;
}

.me-1 {
  margin-inline-end: 4px;
}

.me-2 {
  margin-inline-end: 8px;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}
</style>