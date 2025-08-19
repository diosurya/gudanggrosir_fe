<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient from "@/api/axios"

const router = useRouter()

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
  status: "Draft",
  category_id: null,
  image_url: null
})
const categories = ref<{ id: number; name: string }[]>([])
const previewSrc = ref<string | null>(null)

const fetchCategories = async () => {
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data.data
  } catch (err) {
    console.error("Failed to load categories", err)
  }
}

const selectedCategory = computed({
  get: () => blog.value.category_id ? Number(blog.value.category_id) : null,
  set: (val: number) => {
    blog.value.category_id = val
  }
})

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
    blog.value.image_url = res.data.url
  } catch (err) {
    console.error("Upload failed", err)
  }
}

const resetImage = () => {
  previewSrc.value = null
  blog.value.image_url = null
}

const saveBlog = async () => {
  saving.value = true
  try {
    await blogService.create(blog.value)
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
  fetchCategories()
})

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Blogs", disabled: false, href: "/admin/pages/blogs" },
  { title: "Add Blog", disabled: true, href: "#" }
])
</script>

<template>
  <BaseBreadcrumb title="Add Blog" :breadcrumbs="breadcrumbs" />

  <v-row>
    <!-- Main Form -->
    <v-col cols="8">
      <UiParentCard title="Add Blog">
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

      <!-- Category -->
      <UiParentCard :title="'Category'" class="mb-3">
        <v-row>
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <v-select
              v-model="selectedCategory"
              :items="categories"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
      </UiParentCard>

      <!-- Feature Image -->
      <UiParentCard :title="'Feature Image'">
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
