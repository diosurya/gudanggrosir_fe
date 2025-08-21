<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import SelectCategory from "./components/CategorySelect.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient from "@/api/axios"

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(false)
const saving = ref(false)
const blog = ref<Partial<Blog>>({})
const categories = ref<{ id: number; name: string }[]>([])
const categoriesLoading = ref(false)

const previewSrc = ref<string | null>(null)

const fetchBlog = async () => {
  loading.value = true
  try {
    const { data } = await blogService.getById(id)
    blog.value = data
    // previewSrc.value = blog.value.image_url || null
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
    categories.value = res.data.data
  } catch (err) {
    console.error("Failed to load categories", err)
  } finally {
    categoriesLoading.value = false
  }
}

const selectedCategory = computed({
  get: () => blog.value.category_id ? Number(blog.value.category_id) : null,
  set: (val: number | null) => {
    // blog.value.category_id = val
  }
})

// Handler untuk ketika category baru ditambahkan
const onCategoryAdded = (newCategory: { id: number; name: string }) => {
  // Refresh categories list
  categories.value.push(newCategory)
  // Auto-select kategori yang baru dibuat sudah dihandle di komponen SelectCategory
}

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]

  const reader = new FileReader()
  reader.onload = (ev) => {
    previewSrc.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)

  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    // blog.value.image_url = res.data.url
  } catch (err) {
    console.error("Upload failed", err)
  }
}

const resetImage = () => {
  previewSrc.value = null
  // blog.value.image_url = null
}

const saveBlog = async () => {
  saving.value = true
  try {
    await blogService.update(id, blog.value)
    router.push("/admin/pages/blogs")
  } catch (err) {
    console.error("Failed to save blog", err)
  } finally {
    saving.value = false
  }
}

const statusOptions = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Published', value: 'Published' },
  { label: 'Deactived', value: 'Deactived' }
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
  <BaseBreadcrumb :title="blog.title" :breadcrumbs="breadcrumbs" />

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
              <v-text-field v-model="blog.title" variant="outlined" density="compact" hide-details />
            </v-col>

            <!-- Slug -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <v-text-field v-model="blog.slug" variant="outlined" density="compact" hide-details />
            </v-col>

            <!-- Excerpt -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <v-textarea v-model="blog.excerpt" variant="outlined" rows="2" density="compact" />
            </v-col>

            <!-- Content -->
            <v-col cols="12" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <v-textarea v-model="blog.content" rows="8" density="compact" />
            </v-col>

            <!-- SEO Settings -->
            <v-col cols="12" class="mb-1">
              <h3 class="font-semibold">SEO Settings</h3>
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <v-text-field v-model="blog.seo_title" variant="outlined" density="compact" hide-details />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
              <v-textarea v-model="blog.seo_keywords" variant="outlined" rows="2" density="compact" />
            </v-col>

            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <v-textarea v-model="blog.seo_description" variant="outlined" rows="2" density="compact" />
            </v-col>

            <!-- Save / Cancel -->
            <v-col cols="12" class="flex gap-3">
              <v-btn class="mr-2" color="primary" @click="saveBlog" :loading="saving">Save</v-btn>
              <v-btn color="secondary" @click="router.push('/admin/pages/blogs')">Cancel</v-btn>
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
          <SkeletonLoader type="card" :rows="5" />
        </template>
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
      </UiParentCard>

      <!-- Category - Menggunakan SelectCategory component -->
      <UiParentCard :title="'Category'" class="mb-3">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="5" />
        </template>
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
      </UiParentCard>

      <!-- Feature Image -->
      <UiParentCard :title="'Feature Image'">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="5" />
        </template>
        <v-row>
          <v-col cols="12" class="mb-4">
            <div class="flex flex-col items-center gap-4">
              <img
                v-if="previewSrc"
                :src="previewSrc"
                alt="Preview Image"
                class="shadow-md rounded-xl w-full sm:w-64"
                style="filter: grayscale(100%)"
              />
              <input class="m-2 mb-2 btn btn-primary" type="file" @change="handleImageUpload" />
              <v-btn v-if="previewSrc" color="error" size="small" @click="resetImage">Remove</v-btn>
            </div>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>