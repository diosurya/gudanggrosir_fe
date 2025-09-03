const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateImageMetadata = async () => {
  if (!selectedImage.value) return

  updatingMetadata.value = true
  try {
    const response = await apiClient.put(`/media/${selectedImage.value.id}`, {
      alt_text: editableImage.value.alt_text,
      description: editableImage.value.description
    })

    // Update selected image with new data
    if (selectedImage.value) {
      selectedImage.value.alt_text = editableImage.value.alt_text
      selectedImage.value.description = editableImage.value.description
    }

    // Update in images array
    const imageIndex = images.value.findIndex(img => img.id === selectedImage.value?.id)
    if (imageIndex !== -1) {
      images.value[imageIndex].alt_text = editableImage.value.alt_text
      images.value[imageIndex].description = editableImage.value.description
    }

    console.log('Metadata updated successfully')
  } catch (error) {
    console.error('Failed to update metadata:', error)
  } finally {
    updatingMetadata.value = false
  }
}

const copyImageUrl = () => {
  if (selectedImage.value) {
    const url = selectedImage.value.full_url || getImageUrl(selectedImage.value.path)
    navigator.clipboard.writeText(url).then(() => {
      // Show success message - you can replace with your toast notification
      console.log('URL copied to clipboard')
      
      // Optional: Show temporary success message
      // You can implement a toast notification here
    }).catch(err => {
      console.error('Failed to copy URL:', err)
    })
  }
}

const downloadImage = () => {
  if (selectedImage.value) {
    const url = selectedImage.value.full_url || getImageUrl(selectedImage.value.path)
    const link = document.createElement('a')
    link.href = url
    link.download = selectedImage.value.name || 'image'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }<template>
  <div>
    <BaseBreadcrumb :title="'Media Gallery'" :breadcrumbs="breadcrumbs" />

    <UiParentCard title="Media Gallery">
      <!-- Upload Button -->
      <div class="mb-6">
        <v-btn 
          color="primary"
          @click="openUploadModal"
        >
          Upload
        </v-btn>
      </div>

      <!-- Loading State -->
      <template v-if="loading">
        <v-row>
          <v-col 
            v-for="n in 12" 
            :key="n" 
            cols="12" 
            sm="6" 
            md="4" 
            lg="3"
          >
            <v-skeleton-loader type="image" height="200"></v-skeleton-loader>
          </v-col>
        </v-row>
      </template>

      <!-- Image Grid -->
      <template v-else-if="images.length > 0">
        <v-row>
          <v-col 
            v-for="image in images" 
            :key="image.id"
            cols="12" 
            sm="6" 
            md="4" 
            lg="3"
          >
            <v-card class="image-card" hover>
              <div class="image-container" @click="viewImage(image)">
                <v-img
                  :src="getImageUrl(image.path)"
                  :alt="image.name"
                  aspect-ratio="1"
                  cover
                  class="cursor-pointer"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </div>
              
              <v-card-text class="pa-2">
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ image.name }}
                </div>
                <div class="text-caption text-grey">
                  {{ formatFileSize(image.size) }}
                </div>
              </v-card-text>

              <v-card-actions class="pa-2 pt-0">
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  @click="viewImage(image)"
                >
                  View
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  @click="deleteImage(image)"
                  :loading="deletingIds.includes(image.id)"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Empty State -->
      <template v-else>
        <div class="text-center py-12">
          <v-icon size="64" color="grey-lighten-2">mdi-image-multiple</v-icon>
          <h3 class="text-h6 mt-4 mb-2">No images found</h3>
          <p class="text-body-2 text-grey mb-4">Upload your first image to get started</p>
          <v-btn color="primary" @click="openUploadModal">
            Upload Images
          </v-btn>
        </div>
      </template>
    </UiParentCard>

    <!-- Upload Modal -->
    <v-dialog v-model="uploadModal" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          Upload Images
        </v-card-title>

        <v-card-text>
          <div class="upload-area" :class="{ 'dragover': isDragOver }">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="d-none"
            />
            
            <div 
              class="upload-drop-zone"
              @click="$refs.fileInput.click()"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleFileDrop"
            >
              <v-icon size="48" color="primary">mdi-cloud-upload</v-icon>
              <h4 class="mt-2">Click to upload or drag and drop</h4>
              <p class="text-caption text-grey mt-1">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>

          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0" class="mt-4">
            <h6 class="text-subtitle-2 mb-2">Selected Files ({{ selectedFiles.length }})</h6>
            <div class="selected-files">
              <v-chip
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="ma-1"
                closable
                @click:close="removeSelectedFile(index)"
              >
                <v-icon start>mdi-file-image</v-icon>
                {{ file.name }}
              </v-chip>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-4">
            <v-progress-linear
              :model-value="uploadProgress"
              color="primary"
              height="6"
              rounded
            ></v-progress-linear>
            <div class="text-caption text-center mt-1">
              Uploading... {{ uploadProgress }}%
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closeUploadModal"
            :disabled="uploading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="uploadFiles"
            :disabled="selectedFiles.length === 0 || uploading"
            :loading="uploading"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Image Viewer Modal with Sidebar -->
    <v-dialog v-model="viewModal" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card v-if="selectedImage" class="d-flex flex-column" height="100vh">
        <!-- Header -->
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 bg-grey-lighten-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-image</v-icon>
            <span class="text-h6">{{ selectedImage.name }}</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="large"
            @click="viewModal = false"
          ></v-btn>
        </v-card-title>

        <!-- Main Content Area -->
        <div class="d-flex flex-1 overflow-hidden">
          <!-- Image Display Area -->
          <div class="flex-1 d-flex align-center justify-center bg-black">
            <v-img
              :src="getImageUrl(selectedImage.path)"
              :alt="selectedImage.name"
              max-height="calc(100vh - 80px)"
              max-width="100%"
              contain
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="white" indeterminate size="64"></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>

          <!-- Sidebar -->
          <div class="sidebar bg-white" style="width: 350px; min-width: 350px;">
            <div class="pa-4 h-100 overflow-y-auto">
              <!-- Image Preview -->
              <div class="mb-4">
                <v-img
                  :src="getImageUrl(selectedImage.path)"
                  :alt="selectedImage.name"
                  aspect-ratio="16/9"
                  cover
                  class="rounded"
                ></v-img>
              </div>

              <!-- Image Details -->
              <div class="mb-6">
                <h3 class="text-h6 mb-3">Image Details</h3>
                
                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Name:</label>
                  <p class="text-body-2 mt-1 mb-0">{{ selectedImage.name }}</p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">File Size:</label>
                  <p class="text-body-2 mt-1 mb-0">{{ selectedImage.formatted_size || formatFileSize(selectedImage.size) }}</p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Dimensions:</label>
                  <p class="text-body-2 mt-1 mb-0">
                    {{ selectedImage.dimensions || (selectedImage.width && selectedImage.height ? `${selectedImage.width} x ${selectedImage.height} px` : 'N/A') }}
                  </p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">File Type:</label>
                  <p class="text-body-2 mt-1 mb-0">{{ selectedImage.type }}</p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Extension:</label>
                  <p class="text-body-2 mt-1 mb-0">.{{ selectedImage.extension }}</p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Upload Date:</label>
                  <p class="text-body-2 mt-1 mb-0">{{ formatDate(selectedImage.created_at) }}</p>
                </div>

                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">File Path:</label>
                  <p class="text-body-2 mt-1 mb-0 text-break">{{ selectedImage.path }}</p>
                </div>

                <div class="detail-item mb-4">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Full URL:</label>
                  <div class="d-flex align-center mt-1">
                    <code class="text-caption text-break mr-2 flex-1">{{ selectedImage.full_url || getImageUrl(selectedImage.path) }}</code>
                    <v-btn
                      icon="mdi-content-copy"
                      size="small"
                      variant="text"
                      @click="copyImageUrl"
                      class="ml-2"
                    ></v-btn>
                  </div>
                </div>
              </div>

              <!-- Metadata Section -->
              <div class="mb-6">
                <h3 class="text-h6 mb-3">Metadata</h3>
                
                <div class="detail-item mb-3">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Alt Text:</label>
                  <v-textarea
                    v-model="editableImage.alt_text"
                    variant="outlined"
                    density="compact"
                    rows="2"
                    placeholder="Enter alt text for accessibility..."
                    class="mt-1"
                  ></v-textarea>
                </div>

                <div class="detail-item mb-4">
                  <label class="text-body-2 font-weight-bold text-grey-darken-2">Description:</label>
                  <v-textarea
                    v-model="editableImage.description"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    placeholder="Enter image description..."
                    class="mt-1"
                  ></v-textarea>
                </div>

                <v-btn
                  color="primary"
                  variant="flat"
                  @click="updateImageMetadata"
                  :loading="updatingMetadata"
                  block
                  class="mb-3"
                >
                  Update Metadata
                </v-btn>
              </div>

              <!-- Actions -->
              <div class="border-t pt-4">
                <h3 class="text-h6 mb-3">Actions</h3>
                
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-content-copy"
                  @click="copyImageUrl"
                  block
                  class="mb-2"
                >
                  Copy URL
                </v-btn>

                <v-btn
                  color="success"
                  variant="outlined"
                  prepend-icon="mdi-download"
                  @click="downloadImage"
                  block
                  class="mb-2"
                >
                  Download
                </v-btn>

                <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  @click="deleteImageFromViewer"
                  :loading="deletingIds.includes(selectedImage.id)"
                  block
                >
                  Delete Image
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ imageToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmDelete"
            :loading="deletingIds.includes(imageToDelete?.id)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import apiClient, { BASE_URL } from "@/api/axios"

interface MediaImage {
  id: string
  name: string
  filename?: string
  path: string
  size: number
  type: string
  extension?: string
  width?: number
  height?: number
  alt_text?: string
  description?: string
  dimensions?: string
  formatted_size?: string
  full_url?: string
  created_at: string
}

const router = useRouter()

// State
const loading = ref(false)
const images = ref<MediaImage[]>([])
const uploadModal = ref(false)
const viewModal = ref(false)
const deleteDialog = ref(false)
const selectedFiles = ref<File[]>([])
const selectedImage = ref<MediaImage | null>(null)
const imageToDelete = ref<MediaImage | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragOver = ref(false)
const deletingIds = ref<string[]>([])
const editableImage = ref<Partial<MediaImage>>({})
const updatingMetadata = ref(false)

// Computed
const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Media Gallery", disabled: true, href: "#" }
])

// Methods
const fetchImages = async () => {
  loading.value = true
  try {
    const response = await apiClient.get("/media")
    images.value = response.data.data || []
  } catch (error) {
    console.error("Failed to fetch images:", error)
  } finally {
    loading.value = false
  }
}

const getImageUrl = (path: string) => {
  return `${BASE_URL}${path}`
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openUploadModal = () => {
  uploadModal.value = true
  selectedFiles.value = []
}

const closeUploadModal = () => {
  if (!uploading.value) {
    uploadModal.value = false
    selectedFiles.value = []
    uploadProgress.value = 0
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    selectedFiles.value = Array.from(event.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    )
  }
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    selectedFiles.value.forEach(file => {
      formData.append('images[]', file)
    })

    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    // Refresh images list
    await fetchImages()
    closeUploadModal()
    
    // Show success message (you can replace with your notification system)
    console.log('Upload successful:', response.data)
    
  } catch (error) {
    console.error('Upload failed:', error)
    // Show error message (you can replace with your notification system)
  } finally {
    uploading.value = false
  }
}

const viewImage = (image: MediaImage) => {
  selectedImage.value = image
  editableImage.value = {
    alt_text: image.alt_text || '',
    description: image.description || ''
  }
  viewModal.value = true
}

const deleteImage = (image: MediaImage) => {
  imageToDelete.value = image
  deleteDialog.value = true
}

const deleteImageFromViewer = () => {
  if (selectedImage.value) {
    imageToDelete.value = selectedImage.value
    viewModal.value = false
    deleteDialog.value = true
  }
}

const confirmDelete = async () => {
  if (!imageToDelete.value) return

  const imageId = imageToDelete.value.id
  deletingIds.value.push(imageId)

  try {
    await apiClient.delete(`/media/${imageId}`)
    
    // Remove from images array
    images.value = images.value.filter(img => img.id !== imageId)
    
    deleteDialog.value = false
    imageToDelete.value = null
    
    console.log('Image deleted successfully')
    
  } catch (error) {
    console.error('Failed to delete image:', error)
  } finally {
    deletingIds.value = deletingIds.value.filter(id => id !== imageId)
  }
}

const copyImageUrl = () => {
  if (selectedImage.value) {
    const url = getImageUrl(selectedImage.value.path)
    navigator.clipboard.writeText(url).then(() => {
      // Show success message
      console.log('URL copied to clipboard')
    })
  }
}

// Lifecycle
onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
.image-card {
  transition: transform 0.2s ease-in-out;
}

.image-card:hover {
  transform: translateY(-2px);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.upload-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selected-files {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}
</style>