<script setup lang="ts">
import { computed } from 'vue'
import { usePagesStore } from '@/stores/admin/pages_store'
import { storeToRefs } from 'pinia'
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'

const pageKey = 'about'

const pagesStore = usePagesStore()
const { pages } = storeToRefs(pagesStore)

const page = computed({
  get: () => pages.value[pageKey],
  set: (val) => { pages.value[pageKey] = val }
})

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: page.value?.title || 'Untitled', disabled: true, href: '#' }
])

const savePage = () => {
  pagesStore.updatePage(pageKey, page.value)
  alert('Page saved!')
}
</script>

<template>
  <BaseBreadcrumb :title="page?.title" :breadcrumbs="breadcrumbs" />

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
