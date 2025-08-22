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
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const confirmDialog = ref(false)
const selectedBlog = ref<Blog | null>(null)

const router = useRouter()

const fetchBlogs = async () => {
  loading.value = true
  try {
    const res = await blogService.getAll({
      page: page.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined
    })

    console.log("Response Blogs:", res)

    blogs.value = res.data.data  
    total.value = res.data.total
    perPage.value = res.data.per_page
  } catch (err) {
    console.error("Failed to fetch blogs:", err)
  } finally {
    loading.value = false
  }
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

onMounted(fetchBlogs)
watch([page, searchQuery, startDate, endDate], fetchBlogs)

function getStatusClass(status: string) {
  switch (status) {
    case "publish":
      return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
    case "draft":
      return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
    default:
      return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs";
  }
}
</script>

<template>
  <UiTitleCard title="Blogs" class-name="px-0 pb-0 rounded-md">
    <!-- Filters -->
    <!-- <div class="flex flex-wrap gap-4 p-4">
      <v-text-field
        v-model="searchQuery"
        label="Search..."
        clearable
        variant="outlined"
        density="comfortable"
        class="max-w-xs"
      />
      <v-text-field
        v-model="startDate"
        type="date"
        label="Start Date"
        density="comfortable"
        variant="outlined"
      />
      <v-text-field
        v-model="endDate"
        type="date"
        label="End Date"
        density="comfortable"
        variant="outlined"
      />
    </div> -->

    <!-- Table -->
    <div v-if="loading" class="p-4">
      <SkeletonLoader :rows="5" />
    </div>

    <v-table v-else class="bordered-table" hover density="comfortable">
      <thead class="bg-containerBg">
        <tr>
          <!-- <th class="text-left">ID</th> -->
          <th class="text-left">image</th>
          <th class="text-left">Title</th>
          <th class="text-left">Excerpt</th>
          <!-- <th class="text-left">Author</th> -->
          <th class="text-left">Category</th>
          <th class="text-left">Status</th>
          <th class="text-left w-40">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="blog in blogs" :key="blog.id">
          <!-- <td class="py-3">{{ blog.id }}</td> -->
          <td class="py-3">
            <img :src="getImageUrl(blog.cover_image)" width="50" alt="Image" />
          </td>
          <td class="py-3">{{ blog.title }}</td>
          <td class="py-3 truncate max-w-[300px]">{{ blog.excerpt }}</td>
          <!-- <td class="py-3">{{ blog.author?.name }}</td> -->
          <td class="py-3">{{ blog.category_name }}</td>
          <!-- Status column -->
          <td class="py-3">
            <v-chip variant="text" size="small" class="px-0">
              <v-avatar
                size="8"
                :color="getStatusColor(blog.status)"
                variant="flat"
                class="mr-2"
              ></v-avatar>
              <p class="text-h6 mb-0">{{ blog.status }}</p>
            </v-chip>
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
          <td colspan="6" class="text-center py-4">No data found</td>
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
          Are you sure you want to delete ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Yes, Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiTitleCard>
</template>
