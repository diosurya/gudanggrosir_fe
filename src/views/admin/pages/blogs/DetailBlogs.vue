<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import SelectCategory from "./components/CategorySelect.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient, { BASE_URL } from "@/api/axios"
import { multipartRequest } from "@/api/multipartRequest"


const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(false)
const saving = ref(false)
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
  // category_id: null,
  status: "draft",
  image_url: null
})
const categories = ref<{ id: string; name: string }[]>([])
const categoriesLoading = ref(false)

const previewSrc = ref<string | null>(null)

const fetchBlog = async () => {
  loading.value = true
  try {
    console.log("Fetching blog with ID:", id)
    const response = await blogService.getById(id)
    console.log("Blog response:", response)
    
    // FIX: Pastikan mapping data sesuai dengan response structure
    if (response.data && response.data.data) {
      const blogData = response.data.data
      
      // Map semua field yang ada di response
      blog.value = {
        id: blogData.id,
        title: blogData.title || "",
        slug: blogData.slug || "",
        excerpt: blogData.excerpt || "",
        content: blogData.content || "",
        // FIX: Map field SEO dari response (gunakan meta_* bukan seo_*)
        meta_title: blogData.meta_title || "",
        meta_description: blogData.meta_description || "",
        meta_keywords: blogData.meta_keywords || "",
        category_id: blogData.category_id || null,
        status: blogData.status || "draft",
        image_url: blogData.image_url || null,
        images: blogData.images || []
      }
      
      // Set preview image dari existing image_url
        previewSrc.value = blogData.image_url 
        ? `${BASE_URL}${blogData.image_url}` 
        : null
      
      console.log("Mapped blog data:", blog.value)
    } else {
      console.error("Unexpected response structure:", response)
    }
  } catch (err) {
    console.error("Failed to load blog", err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data.data || []
    console.log("Categories loaded:", categories.value)
  } catch (err) {
    console.error("Failed to load categories", err)
  } finally {
    categoriesLoading.value = false
  }
}

const selectedCategory = computed({
  get: () => blog.value.category_id,
  set: (val: string | null) => {
    blog.value.category_id = val
  }
})

// Handler untuk ketika category baru ditambahkan
const onCategoryAdded = (newCategory: { id: string; name: string }) => {
  categories.value.push(newCategory)
  blog.value.category_id = newCategory.id
}

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]

  // Preview untuk UI
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewSrc.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)

  // Simpan file ke blog.images
  if (!blog.value.images) blog.value.images = []
  blog.value.images = [{ file, is_cover: true }]
}

const resetImage = () => {
  previewSrc.value = null
  blog.value.image_url = null
  blog.value.images = []
}

const saveBlog = async () => {
  if (!blog.value.category_id) {
    alert("Please select a category before saving")
    return
  }

  saving.value = true
  try {
    const formData = new FormData()

    formData.append("title", blog.value.title || "")
    formData.append("slug", blog.value.slug || "")
    formData.append("excerpt", blog.value.excerpt || "")
    formData.append("content", blog.value.content || "")
    formData.append("meta_title", blog.value.meta_title || "")
    formData.append("meta_description", blog.value.meta_description || "")
    formData.append("meta_keywords", blog.value.meta_keywords || "")
    formData.append("category_id", blog.value.category_id || "")
    formData.append("status", blog.value.status || "draft")
    formData.append("_method", "PUT")

    if (blog.value.images && blog.value.images.length > 0) {
      blog.value.images.forEach((img: any) => {
        if (img.file) {
          formData.append("images[]", img.file)
        }
      })
    }

    console.log("Sebelum save data yang dikirim:", formData)
    const response = await multipartRequest("post", `/blogs/${id}`, formData)
    console.log("Update response:", response)

    router.push("/admin/pages/blogs")
  } catch (err) {
    console.error("Failed to save blog", err)
  } finally {
    saving.value = false
  }
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Deactived", value: "deactived" }
]

onMounted(() => {
  fetchBlog()
  fetchCategories()
})

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: false, href: "/admin/pages/blogs" },
  { title: blog.value?.title || "Detail", disabled: true, href: "#" }
])
</script>

<template>
  <BaseBreadcrumb :title="blog.title || 'Detail Blog'" :breadcrumbs="breadcrumbs" />

  <v-row>
    <!-- Main Form -->
    <v-col cols="8">
      <UiParentCard :title="blog.title || 'Detail Blog'">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="5" />
        </template>

        <template v-else>
          <v-row>
            <!-- Title -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <v-text-field 
                v-model="blog.title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Enter blog title"
              />
            </v-col>

            <!-- Slug -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <v-text-field 
                v-model="blog.slug" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Enter blog slug"
              />
            </v-col>

            <!-- Excerpt -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <v-textarea 
                v-model="blog.excerpt" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="Enter blog excerpt"
              />
            </v-col>

            <!-- Content -->
            <v-col cols="12" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <v-textarea 
                v-model="blog.content" 
                rows="8" 
                density="compact" 
                placeholder="Enter blog content"
              />
            </v-col>

            <!-- SEO Settings -->
            <v-col cols="12" class="mb-1">
              <h3 class="font-semibold">SEO Settings</h3>
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <v-text-field 
                v-model="blog.meta_title" 
                variant="outlined" 
                density="compact" 
                hide-details 
                placeholder="Enter Meta title"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <v-textarea 
                v-model="blog.meta_keywords" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="Enter Meta Keywords"
              />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <v-textarea 
                v-model="blog.meta_description" 
                variant="outlined" 
                rows="2" 
                density="compact" 
                placeholder="Enter Meta Description"
              />
            </v-col>

            <!-- Save / Cancel -->
            <v-col cols="12" class="flex gap-3">
              <v-btn class="mr-2" color="primary" @click="saveBlog" :loading="saving">
                Update Blog
              </v-btn>
              <v-btn color="secondary" @click="router.push('/admin/pages/blogs')">
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>
    </v-col>

    <!-- Sidebar -->
    <v-col cols="4">
      <!-- Status -->
      <UiParentCard :title="'Publish'" class="mb-3">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="3" />
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <v-select
                :items="statusOptions"
                item-title="label"
                item-value="value"
                v-model="blog.status"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
        </template>
      </UiParentCard>

      <!-- Category -->
      <UiParentCard :title="'Category'" class="mb-3">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="3" />
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12" class="mb-1">
              <SelectCategory 
                v-model="selectedCategory"
                :categories="categories"
                :loading="categoriesLoading"
                @category-added="onCategoryAdded"
              />
            </v-col>
          </v-row>
        </template>
      </UiParentCard>

      <!-- Feature Image -->
      <UiParentCard :title="'Feature Image'">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="3" />
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12" class="mb-4">
              <div class="flex flex-col items-center gap-4">
                <div v-if="previewSrc" class="relative">
                  <img
                    :src="previewSrc"
                    alt="Preview Image"
                    class="previewSrc"
                  />
                  <v-chip 
                    class="absolute top-2 right-2" 
                    color="success" 
                    size="small"
                  >
                    Current Image
                  </v-chip>
                </div>
                <div v-else class="w-full max-w-64 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span class="text-gray-500">No image selected</span>
                </div>
                
                <input 
                  class="w-full" 
                  type="file" 
                  accept="image/*"
                  @change="handleImageUpload" 
                />
                
                <v-btn 
                  v-if="previewSrc" 
                  color="error" 
                  size="small" 
                  @click="resetImage"
                  variant="outlined"
                >
                  Remove Image
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>

      <!-- Debug Info (Remove in production) -->
      <UiParentCard title="Debug Info" class="mb-3" v-if="!loading">
        <pre class="text-xs">{{ JSON.stringify(blog, null, 2) }}</pre>
      </UiParentCard>
    </v-col>
  </v-row>
</template>