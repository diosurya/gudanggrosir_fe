<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { BASE_URL } from "@/api/axios"

interface Media {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
}

interface Props {
  modelValue: boolean
  filterType?: 'image' | 'video' | 'document' | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', media: Media): void
}

const props = withDefaults(defineProps<Props>(), {
  filterType: null
})

const emit = defineEmits<Emits>()

const media = ref<Media[]>([])
const loading = ref(false)
const searchQuery = ref("")
const selectedMedia = ref<Media | null>(null)
const page = ref(1)
const perPage = ref(12)
const total = ref(0)

// Mock data for demonstration
const mockMedia: Media[] = [
  {
    id: "9fc52aa8-ba5b-48d1-ad8f-f96981c1c44d",
    name: "banner-1.jpg",
    url: "/storage/media/banner-1.jpg",
    type: "image/jpeg",
    size: 1024000,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "2", 
    name: "hero-image.png",
    url: "/storage/media/hero-image.png",
    type: "image/png",
    size: 2048000,
    created_at: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    name: "about-us-banner.jpg",
    url: "/storage/media/about-us-banner.jpg", 
    type: "image/jpeg",
    size: 1536000,
    created_at: "2024-01-13T09:20:00Z"
  },
  {
    id: "4",
    name: "product-showcase.webp",
    url: "/storage/media/product-showcase.webp",
    type: "image/webp", 
    size: 512000,
    created_at: "2024-01-12T14:10:00Z"
  }
]

const fetchMedia = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredMedia = mockMedia
    
    // Filter by type
    if (props.filterType) {
      filteredMedia = filteredMedia.filter(item => 
        item.type.startsWith(props.filterType!)
      )
    }
    
    // Filter by search
    if (searchQuery.value) {
      filteredMedia = filteredMedia.filter(item =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    media.value = filteredMedia
    total.value = filteredMedia.length
    
  } catch (err) {
    console.error("Failed to fetch media:", err)
  } finally {
    loading.value = false
  }
}

const selectMedia = (mediaItem: Media) => {
  selectedMedia.value = mediaItem
}

const confirmSelection = () => {
  if (selectedMedia.value) {
    emit('select', selectedMedia.value)
    closeDialog()
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  selectedMedia.value = null
}

const getImageUrl = (mediaItem: Media) => {
  return mediaItem.url.startsWith('http') ? mediaItem.url : `${BASE_URL}${mediaItem.url}`
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isImage = (type: string) => type.startsWith('image/')

onMounted(fetchMedia)
watch([searchQuery], fetchMedia)
</script>

<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900px"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">Select Media</span>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- Search -->
        <div class="pa-4 border-b">
          <v-text-field
            v-model="searchQuery"
            label="Search media..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
          />
        </div>

        <!-- Media Grid -->
        <div class="pa-4" style="max-height: 500px; overflow-y: auto;">
          <template v-if="loading">
            <div class="grid grid-cols-4 gap-4">
              <div v-for="i in 8" :key="i" class="aspect-square bg-gray-200 rounded animate-pulse"></div>
            </div>
          </template>

          <template v-else-if="media.length > 0">
            <div class="grid grid-cols-4 gap-4">
              <div
                v-for="mediaItem in media"
                :key="mediaItem.id"
                class="relative cursor-pointer group border-2 rounded-lg overflow-hidden transition-all duration-200"
                :class="{
                  'border-primary ring-2 ring-primary/20': selectedMedia?.id === mediaItem.id,
                  'border-gray-200 hover:border-gray-300': selectedMedia?.id !== mediaItem.id
                }"
                @click="selectMedia(mediaItem)"
              >
                <!-- Image Preview -->
                <div class="aspect-square bg-gray-100 flex items-center justify-center">
                  <img
                    v-if="isImage(mediaItem.type)"
                    :src="getImageUrl(mediaItem)"
                    :alt="mediaItem.name"
                    class="w-full h-full object-cover"
                  />
                  <v-icon v-else size="40" class="text-gray-400">
                    mdi-file-outline
                  </v-icon>
                </div>

                <!-- Media Info Overlay -->
                <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p class="text-xs font-medium truncate">{{ mediaItem.name }}</p>
                  <p class="text-xs opacity-80">{{ formatFileSize(mediaItem.size) }}</p>
                </div>

                <!-- Selection Indicator -->
                <div 
                  v-if="selectedMedia?.id === mediaItem.id"
                  class="absolute top-2 right-2 bg-primary rounded-full p-1"
                >
                  <v-icon size="16" color="white">mdi-check</v-icon>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="text-center py-8">
              <v-icon size="64" class="text-gray-400 mb-4">mdi-image-off-outline</v-icon>
              <p class="text-gray-500">No media found</p>
              <p class="text-sm text-gray-400">Try adjusting your search or upload new media</p>
            </div>
          </template>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 border-t">
        <v-spacer />
        <v-btn @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn 
          color="primary" 
          @click="confirmSelection"
          :disabled="!selectedMedia"
        >
          Select Media
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.gap-4 {
  gap: 1rem;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>