<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import apiClient from "@/api/axios"

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(false)
const saving = ref(false)
const blog = ref<Partial<Blog>>({})
const categories = ref<{ id: number; name: string }[]>([])

const fetchBlog = async () => {
  loading.value = true
  try {
    const { data } = await blogService.getById(id)
    blog.value = data
  } catch (err) {
    console.error("Failed to load blog", err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data
  } catch (err) {
    console.error("Failed to load categories", err)
  }
}

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]
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
    <v-col cols="12">
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
              <v-textarea v-model="blog.excerpt" rows="2" density="compact" />
            </v-col>

            <!-- Content -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <!-- nanti bisa diganti WYSIWYG editor -->
              <v-textarea v-model="blog.content" rows="8" density="compact" />
            </v-col>

            <!-- Category -->
            <v-col cols="12" class="mb-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <v-select
                :items="categories"
                item-title="name"
                item-value="id"
                v-model="blog.category_id"
                variant="outlined"
                density="compact"
              />
            </v-col>

            <!-- Image Upload -->
            <v-col cols="12" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <v-row class="items-center gap-4">
                <v-img
                  v-if="blog.image_url"
                  :src="blog.image_url"
                  alt="Blog Image"
                  width="150"
                  height="150"
                  class="rounded"
                />
                <input type="file" @change="handleImageUpload" />
              </v-row>
            </v-col>

            <!-- SEO Section -->
            <v-col cols="12" class="mb-4">
              <h3 class="font-semibold mb-2">SEO Settings</h3>
              <v-text-field v-model="blog.seo_title" label="SEO Title" variant="outlined" density="compact" />
              <v-textarea v-model="blog.seo_description" label="SEO Description" rows="2" density="compact" />
              <v-text-field v-model="blog.seo_keywords" label="SEO Keywords" variant="outlined" density="compact" />
            </v-col>

            <!-- Actions -->
            <v-col cols="12" class="flex gap-3">
              <v-btn color="primary" @click="saveBlog" :loading="saving">Save</v-btn>
              <v-btn color="secondary" @click="router.push('/admin/pages/blogs')">Cancel</v-btn>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
