<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import UiTitleCard from "@/components/shared/UiTitleCard.vue"
import { blogService, type Blog } from "@/api/services/blogService"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import apiClient, { BASE_URL } from "@/api/axios"


const blogs = ref<Blog[]>([])
const total = ref(0)
const page = ref(1)
const perPage = ref(10)
const loading = ref(false)
const searchQuery = ref("")
const statusFilter = ref("all")
const authorFilter = ref("all")
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const confirmDialog = ref(false)
const selectedBlog = ref<Blog | null>(null)

// Store available authors for filter dropdown
const authors = ref<Array<{title: string, value: string}>>([])

const router = useRouter()

const fetchBlogs = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined
    }

    // Add status filter
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    // Add author filter
    if (authorFilter.value !== 'all') {
      params.author_id = authorFilter.value
    }

    const res = await blogService.getAll(params)

    blogs.value = res.data
    total.value = res.pagination.total
    perPage.value = res.pagination.per_page
    page.value = res.pagination.current_page

    // Extract unique authors from blogs for filter dropdown
    updateAuthorsFilter()
  } catch (err) {
    console.error("Failed to fetch blogs:", err)
  } finally {
    loading.value = false
  }
}

// Update authors filter options based on current blogs
const updateAuthorsFilter = () => {
  const uniqueAuthors = new Set()
  const authorOptions = [{ title: 'All Authors', value: 'all' }]
  
  blogs.value.forEach(blog => {
    if (blog.author && !uniqueAuthors.has(blog.author.id)) {
      uniqueAuthors.add(blog.author.id)
      authorOptions.push({
        title: blog.author.name,
        value: blog.author.id.toString()
      })
    }
  })
  
  authors.value = authorOptions
}

const handleEdit = (id: number) => {
  router.push(`/admin/pages/blogs/${id}`)
}

const handleDelete = (blog: Blog) => {
  selectedBlog.value = blog
  confirmDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedBlog.value) return
  loading.value = true
  try {
    await blogService.delete(selectedBlog.value.id)
    await fetchBlogs()
  } catch (err) {
    console.error("Failed to delete blog:", err)
  } finally {
    confirmDialog.value = false
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'grey'
    case 'deactived': return 'error'
    default: return 'grey'
  }
}

const getImageUrl = (path: string | null) => {
  if (!path) return "https://via.placeholder.com/50"
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

function getStatusClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
    case "draft":
      return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
    case "deactived":
      return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
    default:
      return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
  }
}

onMounted(fetchBlogs)

// Add debounce for search and reset page when filters change
watch([searchQuery, statusFilter, authorFilter, startDate, endDate], () => {
  page.value = 1 // Reset to first page when filters change
  fetchBlogs()
}, { debounce: 300 })

watch(page, fetchBlogs)
</script>

<template>
  <!-- Filters -->
  <v-row class="mb-4">
    <v-col cols="12" md="3">
      <v-text-field
        v-model="searchQuery"
        label="Search..."
        clearable
        variant="outlined"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-select
        v-model="statusFilter"
        label="Status"
        variant="outlined"
        :items="[
          { title: 'All Status', value: 'all' },
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
          { title: 'Deactivated', value: 'deactived' }
        ]"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-select
        v-model="authorFilter"
        label="Author"
        variant="outlined"
        :items="authors"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="startDate"
        type="date"
        label="Start Date"
        variant="outlined"
      />
    </v-col>
  </v-row>

  <UiTitleCard title="Blogs" class-name="px-0 pb-0 rounded-md">
    <!-- Table -->
    <div v-if="loading" class="p-4">
      <SkeletonLoader :rows="5" />
    </div>

    <v-table v-else hover density="comfortable">
      <thead class="bg-containerBg">
        <tr>
          <th class="text-left">Image</th>
          <th class="text-left">Title</th>
          <th class="text-left">Excerpt</th>
          <th class="text-left">Author</th>
          <th class="text-left">Category</th>
          <th class="text-left">Status</th>
          <th class="text-left w-40">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="blog in blogs" :key="blog.id">
          <td class="py-3">
            <img :src="getImageUrl(blog.cover_image ?? null)" width="50" alt="Image" />
          </td>
          <td class="py-3">{{ blog.title }}</td>
          <td class="py-3 truncate max-w-[300px]">{{ blog.excerpt }}</td>
          <td class="py-3">{{ blog.author_name || 'No Author' }}</td>
          <td class="py-3">{{ blog.category_name }}</td>
          <!-- Status column -->
          <td class="py-3">
            <p :class="`text-h6 mb-0 ${getStatusClass(blog.status)}`">{{ blog.status }}</p>
          </td>

          <td class="py-3 flex gap-2">
            <v-btn size="small" class="mr-1" color="primary" @click="handleEdit(blog.id)">
                <EditOutlined class="mr-1" />
            </v-btn>
            <v-btn
              size="small"
              color="error"
              variant="outlined"
              @click="handleDelete(blog)"
            >
              <DeleteOutlined class="mr-1" />
            </v-btn>
          </td>
        </tr>
        <tr v-if="!blogs.length">
          <td colspan="7" class="text-center py-4">No data found</td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <div class="flex justify-center py-4" v-if="total > 0">
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
          Are you sure you want to delete "{{ selectedBlog?.title }}"?
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