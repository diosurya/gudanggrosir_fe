<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import BlogFormFields from "./components/BlogFormFields.vue"
import BlogSidebar from "./components/BlogSidebar.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient from "@/api/axios"
import { multipartRequest } from "@/api/multipartRequest"

const router = useRouter()
const route = useRoute()

const getUserIdFromLocalStorage = (): string | null => {
  try {
    const userData = localStorage.getItem("user")
    if (!userData) return null

    const parsedUser = JSON.parse(userData)
    return parsedUser?.id ?? null
  } catch (error) {
    console.error("Error parsing user from localStorage:", error)
    return null
  }
}


// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id)
const blogId = computed(() => route.params.id as string)

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const initialDataLoaded = ref(false)

// ✅ Blog initial state (pakai image_url konsisten)
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
  author_id: getUserIdFromLocalStorage(),
  status: "draft",
  image_url: null,
  images: []
})

const categories = ref<{ id: string; name: string }[]>([])
const selectedFile = ref<File | null>(null)
const previewSrc = ref<string | null>(null)

// Reset form
const resetForm = () => {
  blog.value = {
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
    author_id: getUserIdFromLocalStorage(),
    category_id: null,
    status: "draft",
    image_url: null
  }
  selectedFile.value = null
  previewSrc.value = null
  error.value = null
}

// Fetch blog (edit mode)
const fetchBlog = async (id: string) => {
  loading.value = true
  error.value = null
  try {
    let response
    if (blogService && typeof blogService.getBlog === "function") {
      response = await blogService.getBlog(id)
    } else {
      response = await apiClient.get(`/blogs/${id}`)
    }

    const blogData = response.data?.data || response.data

    blog.value = {
      ...blog.value,
      ...blogData
    }

    if (!blogData.author_id) {
      blog.value.author_id = getUserIdFromLocalStorage()
    }

    if (blog.value.image_url) {
      previewSrc.value = blog.value.image_url
    }

    initialDataLoaded.value = true
  } catch (err: any) {
    console.error("Failed to fetch blog:", err)
    error.value = "Failed to load blog data. Please try again."
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
    categories.value = res.data?.data ?? res.data ?? []
  } catch (err) {
    console.error("Failed to load categories", err)
    error.value = "Failed to load categories"
  }
}

// Validation
const validateForm = (): string[] => {
  const errors: string[] = []
  if (!blog.value.title?.trim()) errors.push("Title is required")
  if (!blog.value.slug?.trim()) errors.push("Slug is required")
  if (!blog.value.content?.trim()) errors.push("Content is required")
  if (blog.value.seo_title && blog.value.seo_title.length > 60) {
    errors.push("SEO title should be less than 60 characters")
  }
  if (blog.value.seo_description && blog.value.seo_description.length > 160) {
    errors.push("SEO description should be less than 160 characters")
  }
  return errors
}

// Save blog
const saveBlog = async () => {
  error.value = null
  const validationErrors = validateForm()
  if (validationErrors.length > 0) {
    error.value = validationErrors.join(", ")
    return
  }

  saving.value = true
  try {
    const formData = new FormData()

    Object.entries(blog.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "images") {
        formData.append(key, String(value))
      }
    })

    if (selectedFile.value) {
      formData.append("images[]", selectedFile.value)
    }

    let response
    if (isEditMode.value) {
      formData.append("_method", "PUT")
      response = await multipartRequest("post", `/blogs/${blogId.value}`, formData)
    } else {
      response = await multipartRequest("post", `/blogs`, formData)
    }

    console.log("✅ Blog saved successfully:", response)
    alert("Blog saved successfully!") // ganti ke toast/notification sesuai UI

    router.push("/admin/pages/blogs")
  } catch (err: any) {
    console.error("Failed to save blog", err)
    if (err.response?.data?.errors) {
      const validationErrors = Object.values(err.response.data.errors).flat()
      error.value = validationErrors.join(", ")
    } else {
      error.value = err.response?.data?.message || "Failed to save blog. Please try again."
    }
  } finally {
    saving.value = false
  }
}

// Handlers
const updateBlog = (updates: Partial<Blog>) => {
  blog.value = { ...blog.value, ...updates }
}
const updateImage = (file: File | null, preview: string | null) => {
  selectedFile.value = file
  previewSrc.value = preview
  if (!file && !preview) {
    blog.value.image_url = null
  }
}
const onCategoryAdded = (newCategory: { id: string; name: string }) => {
  categories.value.push(newCategory)
  blog.value.category_id = newCategory.id
}

// Init
const initializeData = async () => {
  loading.value = true
  initialDataLoaded.value = false
  try {
    const authorId = getUserIdFromLocalStorage()
    if (!authorId) {
      error.value = "Unable to get user information. Please login again."
      return
    }

    await fetchCategories()
    if (isEditMode.value && blogId.value) {
      await fetchBlog(blogId.value)
    } else {
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
onMounted(initializeData)

// Watch route change
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    await initializeData()
  }
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: false, href: "/admin/pages/blogs" },
  { title: isEditMode.value ? "Edit Blog" : "Add Blog", disabled: true, href: "#" }
])
const pageTitle = computed(() => (isEditMode.value ? blog.value.title || "Edit Blog" : "Add Blog"))

// Clear error when typing
watch([() => blog.value.title, () => blog.value.content, () => blog.value.slug], () => {
  if (error.value) error.value = null
})

// Detect unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!initialDataLoaded.value) return false
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
  .v-col-md-8,
  .v-col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
.v-alert {
  margin-bottom: 16px;
}
</style>
