<script setup lang="ts">
import { ref, nextTick } from "vue"

interface Props {
  previewSrc?: string | null
  selectedFile?: File | null
  disabled?: boolean
  maxSize?: number // in MB
  acceptedFormats?: string[]
  recommendedSize?: string
}

interface Emits {
  (e: 'update', file: File | null, preview: string | null): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5,
  acceptedFormats: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  recommendedSize: '1200x630px'
})

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)

// Handle image upload
const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  const file = target.files[0]
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    emit('error', "Please select a valid image file")
    resetFileInput()
    return
  }
  
  // Additional validation for specific formats
  if (!props.acceptedFormats.includes(file.type)) {
    const formats = props.acceptedFormats.map(format => format.split('/')[1].toUpperCase()).join(', ')
    emit('error', `Please select a ${formats} image`)
    resetFileInput()
    return
  }
  
  // Validate file size
  const maxSizeInBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    emit('error', `Image size should be less than ${props.maxSize}MB`)
    resetFileInput()
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (ev) => {
    const preview = ev.target?.result as string
    emit('update', file, preview)
  }
  reader.onerror = () => {
    emit('error', "Failed to read image file")
    resetFileInput()
  }
  reader.readAsDataURL(file)
}

// Reset image
const resetImage = () => {
  emit('update', null, null)
  resetFileInput()
}

// Reset file input
const resetFileInput = () => {
  nextTick(() => {
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  })
}

// Get file size in MB
const getFileSizeInMB = (size: number): string => {
  return (size / 1024 / 1024).toFixed(2)
}

// Get accepted file types for input
const acceptedTypes = computed(() => {
  return props.acceptedFormats.join(',')
})
</script>

<template>
  <div class="d-flex flex-column align-center ga-4">
    <!-- Image Preview -->
    <div v-if="previewSrc" class="w-100">
      <v-img
        :src="previewSrc"
        alt="Preview Image"
        class="rounded-lg"
        cover
        max-height="200"
      />
      <div v-if="selectedFile" class="text-caption text-center mt-2">
        {{ selectedFile.name }} ({{ getFileSizeInMB(selectedFile.size) }} MB)
      </div>
    </div>
    
    <!-- Upload Button -->
    <div class="w-100">
      <v-file-input
        ref="fileInputRef"
        :accept="acceptedTypes"
        label="Choose Image"
        variant="outlined"
        density="compact"
        prepend-icon="mdi-camera"
        :disabled="disabled"
        @change="handleImageUpload"
        :clearable="false"
      />
    </div>
    
    <!-- Remove Button -->
    <v-btn 
      v-if="previewSrc" 
      color="error" 
      size="small" 
      variant="outlined"
      :disabled="disabled"
      @click="resetImage"
      block
    >
      <v-icon start>mdi-delete</v-icon>
      Remove Image
    </v-btn>
    
    <!-- Upload Guidelines -->
    <div class="text-caption text-center text-grey">
      <p>Recommended: {{ recommendedSize }}</p>
      <p>Max size: {{ maxSize }}MB</p>
      <p>Formats: {{ acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ') }}</p>
    </div>
  </div>
</template>

<style scoped>
.v-img {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>