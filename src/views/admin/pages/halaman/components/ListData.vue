<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { pageService } from "@/api/services/pageService"
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'


const router = useRouter()

// Data
const pages = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref("")
const statusFilter = ref("all")
const currentPage = ref(1)
const perPage = ref(10)
const pagination = ref<any>({})

// Headers for data table
const headers = [
  { title: "Title", key: "title", sortable: true },
  { title: "Slug", key: "slug", sortable: true },
  { title: "Status", key: "is_published", sortable: true },
  { title: "Created", key: "created_at", sortable: true },
  { title: "Actions", key: "actions", sortable: false }
]

// Computed
const totalPages = computed(() => {
  if (!pagination.value || !pagination.value.total) return 0
  return Math.ceil(pagination.value.total / pagination.value.per_page)
})


// Methods
const fetchPages = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      per_page: perPage.value
    }
    
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }
    
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    const response = await pageService.getAll(params)
    
    console.log('=== DEBUG INFO ===')
    console.log('Raw API Response:', response)
    console.log('Is response array?:', Array.isArray(response))
    console.log('Response length:', response?.length)
    
    // Handle if response is direct array OR wrapped in success object
    if (Array.isArray(response)) {
      // Direct array response
      pages.value = response
      pagination.value = {} // No pagination info available
    } else if (response && response.success && response.data) {
      // Wrapped response
      pages.value = Array.isArray(response.data) ? response.data : []
      pagination.value = response.pagination || {}
    } else {
      pages.value = []
      pagination.value = {}
    }
    
    console.log('Final pages.value:', pages.value)
    console.log('Final pages.value.length:', pages.value.length)
    console.log('=== END DEBUG ===')
    
  } catch (error) {
    console.error('Failed to fetch pages:', error)
    pages.value = []
    pagination.value = {}
  } finally {
    loading.value = false
  }
}

const deletePage = async (pageId: string) => {
  if (!confirm('Are you sure you want to delete this page?')) return
  
  try {
    await pageService.delete(pageId)
    fetchPages()
  } catch (error) {
    console.error('Failed to delete page:', error)
    alert('Failed to delete page. Please try again.')
  }
}

const getStatusColor = (isPublished: boolean | number) => {
  return (isPublished === true || isPublished === 1) ? 'success' : 'warning'
}

const getStatusText = (isPublished: boolean | number) => {
  return (isPublished === true || isPublished === 1) ? 'Published' : 'Draft'
}

// Watchers
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  fetchPages()
}, { debounce: 300 })

watch(currentPage, fetchPages)

// Lifecycle
onMounted(fetchPages)
</script>

<template>
  
  <v-row>
    <v-col cols="12">
      <UiParentCard title="All Pages">
        <!-- DEBUG INFO - Remove this after fixing -->
        <!-- <v-alert v-if="!loading" type="info" class="mb-4">
          <strong>Debug Info:</strong><br>
          Loading: {{ loading }}<br>
          Pages: {{ pages }}<br>
          Pages Length: {{ pages?.length }}<br>
          Is Array: {{ Array.isArray(pages) }}<br>
          Condition Check: pages={{ !!pages }} && pages.length={{ pages?.length }} > 0 = {{ pages && pages.length > 0 }}
        </v-alert> -->

        <!-- Search and Filters -->
        <div class="mb-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Search pages..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="statusFilter"
                label="Status"
                variant="outlined"
                density="compact"
                hide-details
                :items="[
                  { title: 'All', value: 'all' },
                  { title: 'Published', value: 'published' },
                  { title: 'Draft', value: 'draft' }
                ]"
              />
            </v-col>
            
          </v-row>
        </div>

        <!-- Loading State -->
        <template v-if="loading">
          <SkeletonLoader type="table" :rows="5" />
        </template>

        <!-- Data Table -->
        <template v-else-if="pages && pages.length > 0">
          <v-data-table
            :headers="headers"
            :items="pages"
            :loading="loading"
            class="elevation-1"
            hide-default-footer
          >
            <template v-slot:item.is_published="{ item }">
              <v-chip 
                :color="getStatusColor(!!item.is_published)" 
                size="small"
                variant="flat"
              >
                {{ getStatusText(!!item.is_published) }}
              </v-chip>
            </template>

            <template v-slot:item.created_at="{ item }">
              {{ new Date(item.created_at).toLocaleDateString('id-ID') }}
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="outlined"
                  @click="router.push(`/admin/pages/${item.id}`)"
                >
                  <EditOutlined class="mr-1" />
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="outlined"
                  @click="deletePage(item.id)"
                >
                 <DeleteOutlined class="ml-1" />
                </v-btn>
              </div>
            </template>
          </v-data-table>

          <!-- Pagination -->
          <div class="mt-4 d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
            />
          </div>
        </template>

        <!-- No Data State -->
        <template v-else>
          <v-card class="pa-8 text-center" flat>
            <v-icon size="64" color="grey lighten-1" class="mb-4">
              mdi-file-document-outline
            </v-icon>
            <h3 class="text-h6 mb-2">No Pages Found</h3>
            <p class="text-body-2 text-grey mb-4">
              {{ searchQuery ? 'No pages match your search criteria.' : 'You haven\'t created any pages yet.' }}
            </p>
            <v-btn 
              color="primary" 
              @click="router.push('/admin/pages/create')"
              size="large"
            >
              <v-icon class="mr-2">mdi-plus</v-icon>
              Create First Page
            </v-btn>
          </v-card>
        </template>
      </UiParentCard>
    </v-col>
  </v-row>
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