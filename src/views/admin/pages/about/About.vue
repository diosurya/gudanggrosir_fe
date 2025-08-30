<script setup lang="ts">
import { computed } from 'vue'
import { usePagesStore } from '@/stores/admin/pages_store'
import { storeToRefs } from 'pinia'
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'

import FeatureImageUpload from '@/components/forms/FeatureImageUpload.vue'

const pageKey = 'about'

const pagesStore = usePagesStore()
const { pages } = storeToRefs(pagesStore)

const page = computed({
  get: () => pages.value[pageKey],
  set: (val) => { pages.value[pageKey] = val }
})

// Feature Image state
const featureImage = computed({
  get: () => ({
    enabled: page.value?.featureImage?.enabled || false,
    imageUrl: page.value?.featureImage?.imageUrl || null,
    altText: page.value?.featureImage?.altText || ''
  }),
  set: (val) => {
    if (!page.value) return
    page.value = {
      ...page.value,
      featureImage: val
    }
  }
})


const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: page.value?.title || 'Untitled', disabled: true, href: '#' }
])

const savePage = () => {
  pagesStore.updatePage(pageKey, page.value)
  alert('Page saved!')
}


// Feature Image event handlers
const handleImageUpload = async (file: File) => {
  console.log('Uploading file:', file.name)
  // TODO: Implement actual upload logic here
  // const uploadedUrl = await uploadToServer(file)
  // featureImage.value = { ...featureImage.value, imageUrl: uploadedUrl }
}

const handleImageRemove = () => {
  console.log('Image removed')
  // TODO: Implement cleanup logic if needed
}

const handleBannerToggle = (enabled: boolean) => {
  console.log('Banner toggled:', enabled)
  // TODO: Additional logic when banner is toggled
}


</script>

<template>
  <BaseBreadcrumb :title="page?.title" :breadcrumbs="breadcrumbs" />

  <v-row>
    <v-col cols="12">
      <UiParentCard title="Feature Image">
         <v-row>
          <!-- Feature Image Component -->
          <v-col cols="12">
            <FeatureImageUpload
              v-model="featureImage"
              title="Feature Banner"
              placeholder="Pilih gambar banner untuk halaman About"
              input-label="Upload Banner Image"
              accepted-formats="Format: JPG, PNG, WebP (Maksimal: 5MB)"
              :max-file-size="5"
              upload-endpoint="/api/upload/banner"
              @upload="handleImageUpload"
              @remove="handleImageRemove"
              @toggle="handleBannerToggle"
            />
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
 


  <v-row>
    <v-col cols="12">
      <UiParentCard :title="page?.title">
        <v-row>
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title <span class="text-red-500">*</span>
            </label>
            <v-text-field v-model="page.pageTitle" variant="outlined" density="compact" hide-details />
          </v-col>

          <v-col cols="12" class="mb-1">
            <label>Subtitle</label>
            <v-text-field v-model="page.subtitle" variant="outlined" density="compact" hide-details />
          </v-col>

          <v-col cols="12" class="mb-1">
            <label>SEO Title</label>
            <v-text-field v-model="page.seoTitle" variant="outlined" density="compact" hide-details />
          </v-col>

          <v-col cols="12" class="mb-1">
            <label>SEO Description</label>
            <v-textarea v-model="page.seoDescription" variant="outlined" density="compact" rows="2" counter="400" />
          </v-col>

          <v-col cols="12" class="mb-4">
            <h3>Content</h3>
            <!-- <RichTextEditor v-model="page.content" :height="400" /> -->
          </v-col>

          <v-col cols="12">
            <v-btn color="primary" @click="savePage">Save</v-btn>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
