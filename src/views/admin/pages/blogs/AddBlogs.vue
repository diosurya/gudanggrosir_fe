<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import SelectCategory from "./components/CategorySelect.vue"
import QuillEditorWrapper from "@/components/forms/QuillEditorWrapper.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient from "@/api/axios"
import { multipartRequest } from "@/api/multipartRequest"

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const slugChecking = ref(false)
const slugAvailable = ref<boolean | null>(null)
const error = ref<string | null>(null)

const blog = ref<Partial<Blog>>({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  category_id: null,
  status: "draft"
})

const categories = ref<{ id: string; name: string }[]>([])
const categoriesLoading = ref(false)
const previewSrc = ref<string | null>(null)
// Store the actual file separately for cleaner handling
const selectedFile = ref<File | null>(null)

// Quill editor refs
const editorRef = ref<any>(null)
const editorReady = ref(false)

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Function to generate slug from title
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Function to check slug availability
const checkSlugAvailability = async (slug: string) => {
  if (!slug || slug.length < 3) {
    slugAvailable.value = null
    return
  }

  slugChecking.value = true
  try {
    const response = await apiClient.get(`/blogs/check-slug/${slug}`)
    slugAvailable.value = response.data.available
  } catch (error) {
    console.error('Error checking slug:', error)
    slugAvailable.value = null
  } finally {
    slugChecking.value = false
  }
}

// Debounced slug check
const debouncedSlugCheck = debounce(checkSlugAvailability, 500)

// Watch title changes to auto-generate slug
watch(() => blog.value.title, (newTitle) => {
  if (newTitle && !blog.value.slug) {
    const generatedSlug = generateSlug(newTitle)
    blog.value.slug = generatedSlug
  }
}, { immediate: false })

// Watch slug changes to check availability
watch(() => blog.value.slug, (newSlug) => {
  if (newSlug && newSlug.length >= 3) {
    debouncedSlugCheck(newSlug)
  } else {
    slugAvailable.value = null
  }
}, { immediate: false })

// Handle Quill ready event
const onEditorReady = (editor: any) => {
  editorRef.value = editor
  editorReady.value = true
  console.log('Quill editor is ready!', editor)
}

// Handle Quill content change
const onEditorChange = (content: string) => {
  blog.value.content = content
}

// Fetch categories
const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data.data
  } catch (err) {
    console.error("Failed to load categories", err)
    error.value = "Failed to load categories"
  } finally {
    categoriesLoading.value = false
  }
}

// Category computed property
const selectedCategory = computed({
  get: () => blog.value.category_id,
  set: (val: string | null) => {
    blog.value.category_id = val
  }
})

// Handle new category added
const onCategoryAdded = (newCategory: { id: string; name: string }) => {
  categories.value.push(newCategory)
  blog.value.category_id = newCategory.id
}

// Handle image upload - FIXED VERSION
const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  const file = target.files[0]
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = "Please select a valid image file"
    return
  }
  
  // Additional validation for specific formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = "Please select a JPG, PNG, or WebP image"
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = "Image size should be less than 5MB"
    return
  }

  // Clear any previous errors
  error.value = null

  // Store the actual file
  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewSrc.value = ev.target?.result as string
  }
  reader.onerror = () => {
    error.value = "Failed to read image file"
    selectedFile.value = null
  }
  reader.readAsDataURL(file)
}

// Reset image
const resetImage = () => {
  previewSrc.value = null
  selectedFile.value = null
  blog.value.image_url = null
  if (blog.value.images) {
    blog.value.images = []
  }
  
  // Reset file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

// Generate new slug manually
const regenerateSlug = () => {
  if (blog.value.title) {
    blog.value.slug = generateSlug(blog.value.title)
  }
}

// Form validation
const validateForm = (): string[] => {
  const errors: string[] = []
  
  if (!blog.value.title?.trim()) {
    errors.push("Title is required")
  }
  
  if (!blog.value.slug?.trim()) {
    errors.push("Slug is required")
  }
  
  if (!blog.value.content?.trim()) {
    errors.push("Content is required")
  }
  
  if (!blog.value.category_id) {
    errors.push("Category is required")
  }
  
  if (slugAvailable.value === false) {
    errors.push("Slug is not available, please choose a different one")
  }
  
  return errors
}

// Save blog function - FIXED VERSION
const saveBlog = async () => {
  error.value = null
  
  // Validate form
  const validationErrors = validateForm()
  if (validationErrors.length > 0) {
    error.value = validationErrors.join(', ')
    return
  }

  saving.value = true
  
  try {
    const formData = new FormData()

    // Append text fields
    formData.append("title", blog.value.title || "")
    formData.append("slug", blog.value.slug || "")
    formData.append("excerpt", blog.value.excerpt || "")
    formData.append("content", blog.value.content || "")
    formData.append("seo_title", blog.value.seo_title || "")
    formData.append("seo_description", blog.value.seo_description || "")
    formData.append("seo_keywords", blog.value.seo_keywords || "")
    formData.append("category_id", blog.value.category_id || "")
    formData.append("status", blog.value.status || "draft")

    // Append image file if selected
    if (selectedFile.value) {
      formData.append("images[]", selectedFile.value)
      
      // Debug: Log file details
      console.log("Uploading file:", {
        name: selectedFile.value.name,
        type: selectedFile.value.type,
        size: selectedFile.value.size
      })
    }

    // Debug: Log all FormData entries
    console.log("FormData entries:")
    for (let [key, value] of formData.entries()) {
      console.log(key, value)
    }

    const response = await multipartRequest("post", `/blogs`, formData)
    console.log("Blog saved successfully:", response)
    
    // Redirect to blogs list
    router.push("/admin/pages/blogs")
  
  } catch (err: any) {
    console.error("Failed to save blog", err)
    
    // More detailed error handling
    if (err.response?.data?.errors) {
      // Handle validation errors from Laravel
      const validationErrors = Object.values(err.response.data.errors).flat()
      error.value = validationErrors.join(', ')
    } else {
      error.value = err.response?.data?.message || "Failed to save blog. Please try again."
    }
  } finally {
    saving.value = false
  }
}

// Status options
const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Deactivated", value: "deactivated" }
]

// Initialize on mount
onMounted(async () => {
  loading.value = true
  try {
    await fetchCategories()
  } catch (err) {
    console.error("Initialization error:", err)
  } finally {
    loading.value = false
  }
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: false, href: "/admin/pages/blogs" },
  { title: "Add Blog", disabled: true, href: "#" }
])

// Blog content computed property for Quill
const blogContent = computed({
  get: () => blog.value.content || "",
  set: (val: string) => {
    blog.value.content = val
  }
})

// Clear error when user starts typing
watch([() => blog.value.title, () => blog.value.content], () => {
  if (error.value) {
    error.value = null
  }
})
</script>

<template>
  <div>
    <BaseBreadcrumb :title="blog.title || 'Add Blog'" :breadcrumbs="breadcrumbs" />

    <!-- Error Alert -->
    <v-alert 
      v-if="error" 
      type="error" 
      dismissible 
      @click:close="error = null"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-row>
      <!-- Main Form -->
      <v-col cols="12" md="8">
        <UiParentCard :title="blog.title || 'Add Blog'">
          <template v-if="loading">
            <SkeletonLoader type="card" :rows="5" />
          </template>

          <template v-else>
            <v-form>
              <v-row>
                <!-- Title -->
                <v-col cols="12" class="pb-2">
                  <v-text-field 
                    v-model="blog.title" 
                    label="Title"
                    variant="outlined" 
                    density="compact" 
                    :rules="[v => !!v || 'Title is required']"
                    placeholder="Enter blog title"
                    required
                  />
                </v-col>

                <!-- Slug -->
                <v-col cols="12" class="pb-2">
                  <label class="text-sm font-medium text-gray-700 mb-2 block">Slug</label>
                  <div class="d-flex gap-2 align-center">
                    <v-text-field 
                      v-model="blog.slug" 
                      variant="outlined" 
                      density="compact" 
                      :loading="slugChecking"
                      :color="slugAvailable === true ? 'success' : slugAvailable === false ? 'error' : 'primary'"
                      placeholder="auto-generated-from-title"
                      hide-details
                      class="flex-grow-1"
                    />

                    <v-btn 
                      color="secondary" 
                      size="small"
                      class="ms-2"
                      @click="regenerateSlug"
                      :disabled="!blog.title"
                      variant="outlined"
                    >
                      Regenerate
                    </v-btn>
                    
                  </div>
                  <div v-if="slugAvailable !== null" class="mt-2">
                    <v-chip 
                      size="small" 
                      :color="slugAvailable ? 'success' : 'error'"
                      variant="flat"
                    >
                      {{ slugAvailable ? 'Slug available' : 'Slug already exists' }}
                    </v-chip>
                  </div>
                </v-col>

                <!-- Excerpt -->
                <v-col cols="12" class="pb-2">
                  <v-textarea 
                    v-model="blog.excerpt" 
                    label="Excerpt"
                    variant="outlined" 
                    rows="3" 
                    density="compact" 
                    placeholder="Brief description of the blog post"
                  />
                </v-col>

                <!-- Content with Quill Editor -->
                <v-col cols="12" class="pb-4">
                  <label class="text-sm font-medium text-gray-700 mb-2 block">Content</label>
                  <QuillEditorWrapper
                    v-model="blogContent"
                    @ready="onEditorReady"
                    @change="onEditorChange"
                    placeholder="Write your blog content here..."
                  />
                </v-col>

                <!-- SEO Settings -->
                <v-col cols="12" class="pb-2">
                  <h3 class="text-lg font-semibold mb-3">SEO Settings</h3>
                </v-col>

                <v-col cols="12" class="pb-2">
                  <v-text-field 
                    v-model="blog.seo_title" 
                    label="SEO Title"
                    variant="outlined" 
                    density="compact" 
                    placeholder="SEO optimized title"
                  />
                </v-col>

                <v-col cols="12" class="pb-2">
                  <v-textarea 
                    v-model="blog.seo_keywords" 
                    label="SEO Keywords"
                    variant="outlined" 
                    rows="2" 
                    density="compact" 
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </v-col>

                <v-col cols="12" class="pb-4">
                  <v-textarea 
                    v-model="blog.seo_description" 
                    label="SEO Description"
                    variant="outlined" 
                    rows="3" 
                    density="compact" 
                    placeholder="Meta description for search engines"
                  />
                </v-col>

                <!-- Action Buttons -->
                <v-col cols="12" class="d-flex gap-3">
                  <v-btn 
                    color="primary" 
                    @click="saveBlog" 
                    :loading="saving"
                    :disabled="slugAvailable === false || saving"
                    size="large"
                  >
                    <v-icon start>mdi-content-save</v-icon>
                    Save Blog
                  </v-btn>
                  <v-btn 
                    color="secondary" 
                    variant="outlined"
                    @click="router.push('/admin/pages/blogs')"
                    :disabled="saving"
                    size="large"
                  >
                    <v-icon start>mdi-cancel</v-icon>
                    Cancel
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </template>
        </UiParentCard>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <!-- Status -->
        <UiParentCard title="Publish Settings" class="mb-4">
          <template v-if="loading">
            <SkeletonLoader type="card" :rows="3" />
          </template>
          <template v-else>
            <v-select
              :items="statusOptions"
              item-title="label"
              item-value="value"
              v-model="blog.status"
              label="Status"
              variant="outlined"
              density="compact"
            />
          </template>
        </UiParentCard>

        <!-- Category -->
        <UiParentCard title="Category" class="mb-4">
          <template v-if="loading">
            <SkeletonLoader type="card" :rows="3" />
          </template>
          <template v-else>
            <SelectCategory 
              v-model="selectedCategory"
              :categories="categories"
              :loading="categoriesLoading"
              @category-added="onCategoryAdded"
            />
          </template>
        </UiParentCard>

        <!-- Feature Image -->
        <UiParentCard title="Featured Image">
          <template v-if="loading">
            <SkeletonLoader type="card" :rows="4" />
          </template>
          <template v-else>
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
                <div class="text-caption text-center mt-2">
                  {{ selectedFile?.name }} ({{ (selectedFile?.size / 1024 / 1024).toFixed(2) }} MB)
                </div>
              </div>
              
              <!-- Upload Button -->
              <div class="w-100">
                <v-file-input
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  label="Choose Image"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-camera"
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
                @click="resetImage"
                block
              >
                <v-icon start>mdi-delete</v-icon>
                Remove Image
              </v-btn>
              
              <!-- Upload Guidelines -->
              <div class="text-caption text-center text-grey">
                <p>Recommended: 1200x630px</p>
                <p>Max size: 5MB</p>
                <p>Formats: JPG, PNG, WebP</p>
              </div>
            </div>
          </template>
        </UiParentCard>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
/* Quill editor styling */
:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-container) {
  font-family: inherit;
}

/* Custom form styling */
.v-text-field :deep(.v-field__input) {
  min-height: 40px;
}

.v-textarea :deep(.v-field__input) {
  min-height: 60px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-col-md-8, .v-col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>