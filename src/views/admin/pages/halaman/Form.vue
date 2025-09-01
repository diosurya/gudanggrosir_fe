<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import MediaSelector from "./components/MediaSelector.vue"
import QuillEditorWrapper from "@/components/forms/QuillEditorWrapper.vue"
import { pageService, type Page } from "@/api/services/pageService"
import { BASE_URL } from "@/api/axios"

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const isEdit = computed(() => route.name === 'PageEdit' || !!id)

const loading = ref(false)
const saving = ref(false)
const showMediaSelector = ref(false)

const page = ref<Partial<Page>>({
  title: "",
  slug: "",
  content: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  og_type: "website",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  twitter_card: "summary_large_image",
  structured_data: "",
  is_published: false,
  banner_image_id: null
})

const bannerImage = ref<any>(null)
const previewSrc = ref<string | null>(null)

// Quill editor refs
const editorRef = ref<any>(null)
const editorReady = ref(false)

// Auto-generate slug from title
const generateSlug = () => {
  if (page.value.title) {
    page.value.slug = page.value.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

// Handle Quill ready event
const onEditorReady = (editor: any) => {
  editorRef.value = editor
  editorReady.value = true
  console.log('Quill editor is ready!', editor)
}

// Handle Quill content change
const onEditorChange = (content: string) => {
  page.value.content = content
}

// Page content computed property for Quill
const pageContent = computed({
  get: () => page.value.content || "",
  set: (val: string) => {
    page.value.content = val
  }
})

const fetchPage = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const response = await pageService.getById(id)
    
    console.log('=== PAGE FETCH DEBUG ===')
    console.log('Raw response:', response)
    console.log('Response type:', typeof response)
    console.log('Is response direct object?:', response && !response.success)
    console.log('========================')
    
    // FIX: Handle direct object response (tidak ada wrapper success/data)
    let pageData = null
    
    if (response && response.success && response.data) {
      // Wrapped response format
      pageData = response.data
    } else if (response && response.id) {
      // Direct object response format (seperti response Anda)
      pageData = response
    } else {
      console.error('Unexpected response format:', response)
      return
    }
    
    if (pageData) {
      page.value = {
        id: pageData.id,
        title: pageData.title || "",
        slug: pageData.slug || "",
        content: pageData.content || "",
        meta_title: pageData.meta_title || "",
        meta_description: pageData.meta_description || "",
        meta_keywords: pageData.meta_keywords || "",
        canonical_url: pageData.canonical_url || "",
        og_title: pageData.og_title || "",
        og_description: pageData.og_description || "",
        og_image: pageData.og_image || "",
        og_type: pageData.og_type || "website",
        twitter_title: pageData.twitter_title || "",
        twitter_description: pageData.twitter_description || "",
        twitter_image: pageData.twitter_image || "",
        twitter_card: pageData.twitter_card || "summary_large_image",
        structured_data: pageData.structured_data || "",
        // FIX: Handle is_published sebagai boolean dari integer
        is_published: pageData.is_published === 1 || pageData.is_published === true,
        banner_image_id: pageData.banner_image_id || null,
        // FIX: Tambahkan field yang hilang
        created_at: pageData.created_at,
        updated_at: pageData.updated_at,
        published_at: pageData.published_at
      }
      
      // Set banner image jika ada
      if (pageData.banner_image) {
        bannerImage.value = pageData.banner_image
        previewSrc.value = pageData.banner_image.url?.startsWith('http') 
          ? pageData.banner_image.url 
          : `${BASE_URL}${pageData.banner_image.url}`
      }
      
      console.log('=== FINAL PAGE DATA ===')
      console.log('page.value:', page.value)
      console.log('bannerImage.value:', bannerImage.value)
      console.log('=======================')
    }
  } catch (err) {
    console.error("Failed to load page", err)
    alert("Failed to load page data. Please try again.")
  } finally {
    loading.value = false
  }
}

const onMediaSelected = (media: any) => {
  bannerImage.value = media
  page.value.banner_image_id = media.id
  previewSrc.value = media.url?.startsWith('http') ? media.url : `${BASE_URL}${media.url}`
  showMediaSelector.value = false
}

const resetBannerImage = () => {
  bannerImage.value = null
  page.value.banner_image_id = null
  previewSrc.value = null
}

const savePage = async () => {
  if (!page.value.title || !page.value.slug) {
    alert("Please fill in required fields (Title and Slug)")
    return
  }

  saving.value = true
  try {
    // Helper function to handle JSON validation
    const processStructuredData = (data: string) => {
      if (!data || data.trim() === '') {
        return null // Send null instead of empty string
      }
      
      try {
        // Validate JSON format
        JSON.parse(data)
        return data
      } catch (e) {
        throw new Error('Structured data must be valid JSON')
      }
    }

    const payload = {
      title: page.value.title,
      slug: page.value.slug,
      content: page.value.content || null,
      banner_image_id: page.value.banner_image_id,
      meta_title: page.value.meta_title || null,
      meta_description: page.value.meta_description || null,
      meta_keywords: page.value.meta_keywords || null,
      canonical_url: page.value.canonical_url || null,
      og_title: page.value.og_title || null,
      og_description: page.value.og_description || null,
      og_image: page.value.og_image || null,
      og_type: page.value.og_type || 'website',
      twitter_title: page.value.twitter_title || null,
      twitter_description: page.value.twitter_description || null,
      twitter_image: page.value.twitter_image || null,
      twitter_card: page.value.twitter_card || 'summary_large_image',
      structured_data: processStructuredData(page.value.structured_data || ''),
      is_published: page.value.is_published,
      published_at: page.value.published_at || null
    }

    console.log('=== SAVE PAYLOAD ===')
    console.log('Payload:', payload)
    console.log('===================')

    if (isEdit.value) {
      const result = await pageService.update(id, payload)
      console.log('Update result:', result)
    } else {
      const result = await pageService.create(payload)
      console.log('Create result:', result)
    }

    router.push("/admin/pages")
  } catch (err) {
    console.error("Failed to save page", err)
    
    // Show more specific error message
    if (err instanceof Error) {
      alert(err.message)
    } else {
      alert("Failed to save page. Please try again.")
    }
  } finally {
    saving.value = false
  }
}

const statusOptions = [
  { title: "Draft", value: false },
  { title: "Published", value: true }
]

onMounted(() => {
  fetchPage()
})

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Pages", disabled: false, href: "/admin/pages" },
  { title: isEdit.value ? (page.value?.title || "Edit") : "Add New", disabled: true, href: "#" }
])
</script>

<template>
  <BaseBreadcrumb 
    :title="isEdit ? (page.title || 'Edit Page') : 'Add New Page'" 
    :breadcrumbs="breadcrumbs" 
  />

  <v-row>
    <!-- Main Form -->
    <v-col cols="12" lg="8">
      <UiParentCard :title="isEdit ? 'Edit Page' : 'Create New Page'">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="8" />
        </template>

        <template v-else>
          <v-row>
            <!-- Basic Information -->
            <v-col cols="12" class="mb-2">
              <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
            </v-col>

            <!-- Title -->
            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Title <span class="text-red-500">*</span>
              </label>
              <v-text-field 
                v-model="page.title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Enter page title"
                @input="generateSlug"
              />
            </v-col>

            <!-- Slug -->
            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Slug <span class="text-red-500">*</span>
              </label>
              <v-text-field 
                v-model="page.slug" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="page-url-slug"
                hint="URL-friendly version of the title"
              />
            </v-col>

            <!-- Content with QuillEditor -->
            <v-col cols="12" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <QuillEditorWrapper
                v-model="pageContent"
                @ready="onEditorReady"
                @change="onEditorChange"
                placeholder="Write your page content here..."
              />
            </v-col>

            <!-- SEO Meta Tags -->
            <v-col cols="12" class="mb-2">
              <h3 class="text-lg font-semibold mb-4">SEO Meta Tags</h3>
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <v-text-field 
                v-model="page.meta_title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="SEO title for search engines"
                counter="60"
              />
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <v-text-field 
                v-model="page.canonical_url" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="https://example.com/canonical-url"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <v-textarea 
                v-model="page.meta_description" 
                variant="outlined" 
                rows="3" 
                density="compact" 
                placeholder="Brief description for search engines"
                counter="160"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <v-textarea 
                v-model="page.meta_keywords" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="keyword1, keyword2, keyword3"
                hint="Comma-separated keywords"
              />
            </v-col>

            <!-- Open Graph -->
            <v-col cols="12" class="mb-2">
              <h3 class="text-lg font-semibold mb-4">Open Graph (Facebook)</h3>
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
              <v-text-field 
                v-model="page.og_title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Title for social media sharing"
              />
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">OG Type</label>
              <v-select
                v-model="page.og_type"
                variant="outlined"
                density="compact"
                hide-details
                :items="['website', 'article', 'product', 'profile']"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
              <v-textarea 
                v-model="page.og_description" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="Description for social media sharing"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
              <v-text-field 
                v-model="page.og_image" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="https://example.com/og-image.jpg"
              />
            </v-col>

            <!-- Twitter Card -->
            <v-col cols="12" class="mb-2">
              <h3 class="text-lg font-semibold mb-4">Twitter Card</h3>
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Title</label>
              <v-text-field 
                v-model="page.twitter_title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Title for Twitter sharing"
              />
            </v-col>

            <v-col cols="12" md="6" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Card Type</label>
              <v-select
                v-model="page.twitter_card"
                variant="outlined"
                density="compact"
                hide-details
                :items="['summary', 'summary_large_image', 'app', 'player']"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Description</label>
              <v-textarea 
                v-model="page.twitter_description" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="Description for Twitter sharing"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Image URL</label>
              <v-text-field 
                v-model="page.twitter_image" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="https://example.com/twitter-image.jpg"
              />
            </v-col>

            <!-- Structured Data -->
            <v-col cols="12" class="mb-2">
              <h3 class="text-lg font-semibold mb-4">Advanced</h3>
            </v-col>

            <v-col cols="12" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Structured Data (JSON-LD)</label>
              <v-textarea 
                v-model="page.structured_data" 
                variant="outlined" 
                rows="4" 
                density="compact" 
                placeholder='{"@context": "https://schema.org", "@type": "WebPage", "name": "Page Name"}'
                hint="Valid JSON-LD structured data"
              />
            </v-col>

            <!-- Action Buttons -->
            <v-col cols="12" class="flex gap-3">
              <v-btn 
                color="primary" 
                @click="savePage" 
                :loading="saving"
                size="large"
              >
                <v-icon start>mdi-content-save</v-icon>
                {{ isEdit ? 'Update Page' : 'Create Page' }}
              </v-btn>
              <v-btn 
                color="secondary" 
                variant="outlined"
                @click="router.push('/admin/pages')"
                size="large"
              >
                <v-icon start>mdi-cancel</v-icon>
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>
    </v-col>

    <!-- Sidebar -->
    <v-col cols="12" lg="4">
      <!-- Publishing -->
      <UiParentCard title="Publishing" class="mb-4">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="2" />
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12" class="mb-3">
              <v-switch
                v-model="page.is_published"
                label="Publish this page"
                color="primary"
                hide-details
              />
              <p class="text-sm text-gray-600 mt-1">
                {{ page.is_published ? 'Page will be visible to public' : 'Page will be saved as draft' }}
              </p>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>

      <!-- Banner Image -->
      <UiParentCard title="Banner Image" class="mb-4">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="4" />
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12">
              <div class="flex flex-col items-center gap-4">
                <!-- Image Preview -->
                <div v-if="previewSrc" class="relative w-full">
                  <img
                    :src="previewSrc"
                    alt="Banner Preview"
                    class="w-full h-48 object-cover rounded-lg border"
                  />
                  <v-chip 
                    class="absolute top-2 right-2" 
                    color="success" 
                    size="small"
                  >
                    <v-icon size="16" class="mr-1">mdi-check</v-icon>
                    Selected
                  </v-chip>
                </div>
                
                <!-- No Image State -->
                <div v-else class="w-full mb-3 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div class="text-center">
                    <v-icon size="48" class="text-gray-400 mb-2">mdi-image-outline</v-icon>
                    <p class="text-gray-500 text-sm">No banner image selected</p>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-2 w-full">
                  <v-btn 
                    color="primary" 
                    variant="outlined"
                    @click="showMediaSelector = true"
                    block
                  >
                    <v-icon class="mr-2">mdi-image-plus</v-icon>
                    Select Image
                  </v-btn>
                  
                  <v-btn 
                    v-if="previewSrc" 
                    color="error" 
                    variant="outlined"
                    @click="resetBannerImage"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>

                <!-- Image Info -->
                <div v-if="bannerImage" class="w-full bg-gray-50 p-3 rounded">
                  <p class="text-sm font-medium">{{ bannerImage.name }}</p>
                  <p class="text-xs text-gray-500">
                    ID: {{ bannerImage.id }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>

      <!-- Quick SEO Preview -->
      <UiParentCard title="SEO Preview" class="mb-4">
        <div class="border rounded-lg p-4 bg-gray-50">
          <div class="mb-2">
            <h4 class="text-blue-600 text-lg hover:underline cursor-pointer">
              {{ page.meta_title || page.title || 'Page Title' }}
            </h4>
            <p class="text-green-700 text-sm">
              {{ page.canonical_url || 'https://example.com/' }}{{ page.slug }}
            </p>
          </div>
          <p class="text-gray-700 text-sm">
            {{ page.meta_description || 'Meta description will appear here...' }}
          </p>
        </div>
      </UiParentCard>

      <!-- Page Info (for edit mode) -->
      <UiParentCard v-if="isEdit && page.created_at" title="Page Information" class="mb-4">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Created:</span>
            <span>{{ new Date(page.created_at).toLocaleDateString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Updated:</span>
            <span>{{ new Date(page.updated_at).toLocaleDateString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Published:</span>
            <span>{{ page.published_at ? new Date(page.published_at).toLocaleDateString('id-ID') : 'Not published' }}</span>
          </div>
        </div>
      </UiParentCard>
    </v-col>
  </v-row>

  <!-- Media Selector Modal -->
  <MediaSelector
    v-model="showMediaSelector"
    @select="onMediaSelected"
    filter-type="image"
  />
</template>

<style scoped>
.bordered-table {
  border: 1px solid #e0e0e0;
}

.bordered-table th,
.bordered-table td {
  border-bottom: 1px solid #e0e0e0;
}

/* Custom styling for form sections */
h3 {
  color: #1a1a1a;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

/* Quill editor styling */
:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-container) {
  font-family: inherit;
}
</style>