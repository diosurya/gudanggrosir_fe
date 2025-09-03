<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import UiTitleCard from "@/components/shared/UiTitleCard.vue"
import { pageService } from "@/api/services/pageService"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const pages = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const perPage = ref(10)
const loading = ref(false)
const searchQuery = ref("")
const statusFilter = ref("all")
const confirmDialog = ref(false)
const selectedPage = ref<any | null>(null)

const router = useRouter()

const fetchPages = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
    }
    
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    const res = await pageService.getAll(params)
    
    // Handle different response formats
    if (Array.isArray(res)) {
      // Direct array response
      pages.value = res
      total.value = res.length
    } else if (res && res.data) {
      // Wrapped response with pagination
      pages.value = res.data
      total.value = res.pagination?.total || res.data.length
      perPage.value = res.pagination?.per_page || 10
      page.value = res.pagination?.current_page || 1
    } else {
      pages.value = []
      total.value = 0
    }
  } catch (err) {
    console.error("Failed to fetch pages:", err)
    pages.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleEdit = (id: number) => {
  router.push(`/admin/pages/${id}`)
}

const handleDelete = (pageItem: any) => {
  selectedPage.value = pageItem
  confirmDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedPage.value) return
  loading.value = true
  try {
    await pageService.delete(selectedPage.value.id)
    await fetchPages()
  } catch (err) {
    console.error("Failed to delete page:", err)
  } finally {
    confirmDialog.value = false
    loading.value = false
  }
}

const getStatusColor = (isPublished: string | number) => {
  return (isPublished == "1" || isPublished === 1) ? 'success' : 'warning'
}

const getStatusText = (isPublished: string | number) => {
  return (isPublished == "1" || isPublished === 1) ? 'Published' : 'Draft'
}

const getStatusClass = (isPublished: string | number) => {
  if (isPublished == "1" || isPublished === 1) {
    return "bg-success text-white px-2 py-1 rounded-full text-xs";
  } else {
    return "bg-yellow text-white px-2 py-1 rounded-full text-xs";
  }
}

onMounted(fetchPages)
watch([page, searchQuery, statusFilter], fetchPages)
</script>

<template>
  <!-- Filters -->
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="searchQuery"
        label="Search..."
        clearable
        variant="outlined"
      />
    </v-col>
    <v-col cols="12" md="6">
      <v-select
        v-model="statusFilter"
        label="Status"
        variant="outlined"
        :items="[
          { title: 'All', value: 'all' },
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' }
        ]"
      />
    </v-col>
  </v-row>

  
  <UiTitleCard title="Pages" class-name="px-0 pb-0 rounded-md">
  
    <!-- Table -->
    <div v-if="loading" class="p-4">
      <SkeletonLoader :rows="5" />
    </div>

    <v-table v-else hover density="comfortable">
      <thead class="bg-containerBg">
        <tr>
          <th class="text-left">Title</th>
          <th class="text-left">Slug</th>
          <th class="text-left">Status</th>
          <th class="text-left">Created</th>
          <th class="text-left w-40">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pageItem in pages" :key="pageItem.id">
          <td class="py-3">{{ pageItem.title }}</td>
          <td class="py-3 text-gray-600">{{ pageItem.slug }}</td>
          <!-- Status column -->
          <td class="py-3">
            <v-chip variant="text" size="small" class="px-0">
              <v-avatar
                size="8"
                :color="getStatusColor(pageItem.is_published)"
                variant="flat"
                class="mr-2"
              ></v-avatar>
                <p class="text-h6 mb-0 ">{{ getStatusText(pageItem.is_published) }}</p>
             
            </v-chip>
          </td>
          <td class="py-3 text-gray-600">
            {{ new Date(pageItem.created_at).toLocaleDateString('id-ID') }}
          </td>
          <td class="py-3 flex gap-2">
            <v-btn size="small" class="mr-1" color="primary" @click="handleEdit(pageItem.id)">
              <EditOutlined class="mr-1" />
            </v-btn>
            <v-btn
              size="small"
              color="error"
              variant="outlined"
              @click="handleDelete(pageItem)"
            >
              <DeleteOutlined class="mr-1" />
            </v-btn>
          </td>
        </tr>
        <tr v-if="!pages.length">
          <td colspan="5" class="text-center py-4">No data found</td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <div class="flex justify-center py-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(total / perPage)"
        total-visible="7"
        color="primary"
      />
    </div>

    <!-- Confirm Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-lg font-semibold">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this page?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Yes, Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiTitleCard>
</template>

<style scoped>
.bordered-table {
  border: 1px solid #e0e0e0;
}

.bordered-table th,
.bordered-table td {
  border-bottom: 1px solid #e0e0e0;
}
</style>