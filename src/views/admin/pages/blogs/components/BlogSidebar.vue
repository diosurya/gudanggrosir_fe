<template>
  <v-col cols="12">
    <!-- Status -->
    <UiParentCard title="Publish" class="mb-3">
      <template v-if="loading">
        <SkeletonLoader type="card" :rows="3" />
      </template>
      <template v-else>
        <v-row>
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <v-select
              v-model="localBlog.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              @change="emitUpdate"
            />
          </v-col>
        </v-row>
      </template>
    </UiParentCard>

    <!-- Category -->
    <UiParentCard title="Category" class="mb-3">
      <template v-if="loading">
        <SkeletonLoader type="card" :rows="3" />
      </template>
      <template v-else>
        <v-row>
          <v-col cols="12" class="mb-1">
            <SelectCategory 
              v-model="localBlog.category_id"
              :categories="categories"
              :loading="categoriesLoading"
              @category-added="onCategoryAdded"
            />
          </v-col>
        </v-row>
      </template>
    </UiParentCard>

    <!-- Feature Image -->
    <UiParentCard title="Feature Image" class="mb-3">
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

    <!-- Debug Info -->
    <UiParentCard title="Debug Info" class="mb-3" v-if="!loading">
      <pre class="text-xs">{{ JSON.stringify(localBlog, null, 2) }}</pre>
    </UiParentCard>
  </v-col>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import SelectCategory from './CategorySelect.vue' // pastikan path-nya sesuai

interface Category {
  id: string
  name: string
}

interface Blog {
  title: string
  slug: string
  excerpt: string
  content: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  category_id: string | null
  status: string
  image_url?: string | null
}

const props = defineProps<{
  blog: Partial<Blog>
  categories: Category[]
  categoriesLoading?: boolean
  previewSrc: string | null
  selectedFile: File | null
  saving: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:blog', updated: Partial<Blog>): void
  (e: 'update:image', file: File | null, preview: string | null): void
  (e: 'category-added', category: Category): void
}>()

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' }
]

// Local blog copy
const localBlog = ref<Partial<Blog>>({ ...props.blog })

watch(() => props.blog, (newVal) => {
  localBlog.value = { ...newVal }
})

const emitUpdate = () => {
  emit('update:blog', localBlog.value)
}

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    emit('update:image', file, reader.result as string)
  }
  reader.readAsDataURL(file)
}

const resetImage = () => {
  emit('update:image', null, null)
}

const onCategoryAdded = (newCategory: Category) => {
  emit('category-added', newCategory)
  localBlog.value.category_id = newCategory.id
  emitUpdate()
}
</script>

<style scoped>
.previewSrc {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.gap-4 {
  gap: 1rem;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.top-2 {
  top: 0.5rem;
}

.right-2 {
  right: 0.5rem;
}

.text-xs {
  font-size: 0.75rem;
}
</style>
