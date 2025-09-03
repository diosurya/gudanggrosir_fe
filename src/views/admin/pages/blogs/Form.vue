<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import BlogFormFields from "./components/BlogFormFields.vue"
import BlogSidebar from "./components/BlogSidebar.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient, {BASE_URL} from "@/api/axios"
import { multipartRequest } from "@/api/multipartRequest"

const router = useRouter()
const route = useRoute()

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id)
const blogId = computed(() => route.params.id as string)

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const initialDataLoaded = ref(false)

// Initialize blog with default values
const blog = ref<Partial<Blog>>({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  category_id: null,
  status: "draft",
  cover_image: null,
  images: []
})

const categories = ref<{ id: string; name: string }[]>([])
const selectedFile = ref<File | null>(null)
const previewSrc = ref<string | null>(null)

// Reset form to default values
const resetForm = () => {
  blog.value = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    category_id: null,
    status: "draft",
    image_url: null
  }
  selectedFile.value = null
  previewSrc.value = null
  error.value = null
}

// Fetch blog data for edit mode
const fetchBlog = async (id: string) => {
  loading.value = true
  error.value = null
  
  try {
    let response
    
    // Try using blogService first, fallback to direct API call
    if (blogService && typeof blogService.getBlog === 'function') {
      response = await blogService.getBlog(id)
    } else {
      // Fallback to direct API call
      response = await apiClient.get(`/blogs/${id}`)
    }
    
    // Handle different response structures
    const blogData = response.data?.data || response.data
    
    // Update blog data with fetched data
    blog.value = {
      ...blog.value,
      ...blogData
    }
    
    // Set preview image if exists
    if (blog.value.image_url) {
      previewSrc.value = blog.value.image_url
    }
    
    initialDataLoaded.value = true
    
  } catch (err: any) {
    console.error("Failed to fetch blog:", err)
    error.value = "Failed to load blog data. Please try again."
    
    // Redirect to blogs list if blog not found
    if (err.response?.status === 404) {
      router.push("/admin/pages/blogs")
    }
  } finally {
    loading.value = false
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data.data || []
  } catch (err) {
    console.error("Failed to load categories", err)
    error.value = "Failed to load categories"
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
  
  // Additional validation for SEO fields if needed
  if (blog.value.seo_title && blog.value.seo_title.length > 60) {
    errors.push("SEO title should be less than 60 characters")
  }
  
  if (blog.value.seo_description && blog.value.seo_description.length > 160) {
    errors.push("SEO description should be less than 160 characters")
  }
  
  return errors
}

// Save blog function
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

    // Append text fields (exclude null/undefined values)
    Object.keys(blog.value).forEach(key => {
      const value = blog.value[key as keyof Blog]
      if (value !== null && value !== undefined && key !== 'image_url' && key !== 'images') {
        formData.append(key, String(value))
      }
    })

    // Append image file if selected
    if (selectedFile.value) {
      formData.append("images[]", selectedFile.value)
    }

    let response
    if (isEditMode.value) {
      // For edit mode, add _method for Laravel PUT request
      formData.append('_method', 'PUT')
      response = await multipartRequest("post", `/blogs/${blogId.value}`, formData)
    } else {
      response = await multipartRequest("post", `/blogs`, formData)
    }

    console.log("Blog saved successfully:", response)
    
    // Show success message (you can add a toast/notification here)
    
    // Redirect to blogs list
    router.push("/admin/pages/blogs")
  
  } catch (err: any) {
    console.error("Failed to save blog", err)
    
    if (err.response?.data?.errors) {
      // Handle Laravel validation errors
      const validationErrors = Object.values(err.response.data.errors).flat()
      error.value = validationErrors.join(', ')
    } else {
      error.value = err.response?.data?.message || "Failed to save blog. Please try again."
    }
  } finally {
    saving.value = false
  }
}

// Handle blog data updates from child components
const updateBlog = (updates: Partial<Blog>) => {
  blog.value = { ...blog.value, ...updates }
}

// Handle image updates
const updateImage = (file: File | null, preview: string | null) => {
  selectedFile.value = file
  previewSrc.value = preview
  
  // If removing image, also clear the image_url
  if (!file && !preview) {
    blog.value.image_url = null
  }
}

// Handle new category added
const onCategoryAdded = (newCategory: { id: string; name: string }) => {
  categories.value.push(newCategory)
  blog.value.category_id = newCategory.id
}

// Initialize data on mount and route change
const initializeData = async () => {
  loading.value = true
  initialDataLoaded.value = false
  
  try {
    // Always fetch categories first
    await fetchCategories()
    
    if (isEditMode.value && blogId.value) {
      // If edit mode, fetch blog data
      await fetchBlog(blogId.value)
    } else {
      // If add mode, reset form
      resetForm()
      initialDataLoaded.value = true
    }
  } catch (err) {
    console.error("Initialization error:", err)
    error.value = "Failed to initialize form data"
  } finally {
    loading.value = false
  }
}

// Initialize on mount
onMounted(initializeData)

// Watch for route changes (when switching between add and edit)
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await initializeData()
    }
  }
)

// Breadcrumbs
const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: false, href: "/admin/pages/blogs" },
  { 
    title: isEditMode.value ? "Edit Blog" : "Add Blog", 
    disabled: true, 
    href: "#" 
  }
])

// Page title
const pageTitle = computed(() => {
  if (isEditMode.value) {
    return blog.value.title || "Edit Blog"
  }
  return "Add Blog"
})

// Clear error when user starts typing
watch([() => blog.value.title, () => blog.value.content, () => blog.value.slug], () => {
  if (error.value) {
    error.value = null
  }
})

// Handle navigation away warning if form has unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!initialDataLoaded.value) return false
  
  // Add logic to detect if form has changes
  // This is a simple implementation - you might want to make it more sophisticated
  return !!(blog.value.title || blog.value.content || selectedFile.value)
})
</script>

<template>
  <div>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs" />

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
        <UiParentCard :title="pageTitle">
          <template v-if="loading">
            <SkeletonLoader type="card" :rows="5" />
          </template>
          <template v-else-if="initialDataLoaded">
            <BlogFormFields
              :blog="blog"
              :is-edit-mode="isEditMode"
              :saving="saving"
              @update:blog="updateBlog"
              @save="saveBlog"
              @cancel="router.push('/admin/pages/blogs')"
            />
          </template>
          <template v-else>
            <div class="text-center pa-4">
              <p>Loading form data...</p>
            </div>
          </template>
        </UiParentCard>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <template v-if="loading">
          <UiParentCard title="Settings">
            <SkeletonLoader type="card" :rows="3" />
          </UiParentCard>
        </template>
        <template v-else-if="initialDataLoaded">
          <BlogSidebar
            :blog="blog"
            :categories="categories"
            :preview-src="previewSrc"
            :selected-file="selectedFile"
            :saving="saving"
            @update:blog="updateBlog"
            @update:image="updateImage"
            @category-added="onCategoryAdded"
          />
        </template>
        <template v-else>
          <UiParentCard title="Settings">
            <div class="text-center pa-4">
              <p>Loading settings...</p>
            </div>
          </UiParentCard>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
@media (max-width: 960px) {
  .v-col-md-8, .v-col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Additional styles for better UX */
.v-alert {
  margin-bottom: 16px;
}
</style>