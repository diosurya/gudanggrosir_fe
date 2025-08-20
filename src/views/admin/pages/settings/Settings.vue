<script setup lang="ts">
import { computed } from 'vue'
import { usePagesStore } from '@/stores/admin/pages_store'
import { storeToRefs } from 'pinia'
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'

const pageKey = 'settings'

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
  alert('Settings saved!')
}
</script>

<template>
  <BaseBreadcrumb :title="page?.title" :breadcrumbs="breadcrumbs" />

  <v-row>
    <v-col cols="12">
      <UiParentCard :title="page?.title">
        <v-row>
          <!-- Kolom Kiri -->
          <v-col cols="4">
            <!-- <v-col cols="12" class="mb-1">
              <label>Judul</label>
              <v-text-field v-model="page.title" variant="outlined" density="compact" hide-details />
            </v-col> -->
            <v-col cols="12" class="mb-1">
              <label>No. Telepon</label>
              <v-text-field v-model="page.no_tlp" variant="outlined" density="compact" placeholder="No. Telpon" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Email</label>
              <v-text-field v-model="page.email" variant="outlined" density="compact" placeholder="mail@mail.com" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Alamat 1</label>
              <v-text-field v-model="page.alamat_1" variant="outlined" density="compact" placeholder="Tulis alamat di sini" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Alamat 2</label>
              <v-text-field v-model="page.alamat_2" variant="outlined" density="compact" placeholder="Tulis alamat di sini" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Alamat 3</label>
              <v-text-field v-model="page.alamat_3" variant="outlined" density="compact" placeholder="Tulis alamat di sini" hide-details />
            </v-col>
          </v-col>

          <!-- Kolom Tengah -->
          <v-col cols="4">
            <v-col cols="12" class="mb-1">
              <label>Link Shopee</label>
              <v-text-field v-model="page.link_shopee" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link Tokopedia</label>
              <v-text-field v-model="page.link_tokped" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link TikTok</label>
              <v-text-field v-model="page.link_tiktok" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link Instagram</label>
              <v-text-field v-model="page.link_instagram" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
          </v-col>

          <!-- Kolom Kanan -->
          <v-col cols="4"  class="mb-1">
            <v-col cols="12" class="mb-1">
              <label>Link Facebook</label>
              <v-text-field v-model="page.link_facebook" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link YouTube</label>
              <v-text-field v-model="page.link_youtube" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link Twitter</label>
              <v-text-field v-model="page.link_twitter" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
            <v-col cols="12" class="mb-1">
              <label>Link LinkedIn</label>
              <v-text-field v-model="page.link_linkedin" variant="outlined" density="compact" placeholder="https://example.com/" hide-details />
            </v-col>
          </v-col>
        </v-row>


        <v-row>
          <v-col cols="12" class="text-right">
            <v-btn color="primary" @click="savePage">Save</v-btn>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
