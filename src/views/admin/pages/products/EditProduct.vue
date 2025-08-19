<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
import { productService, type Product } from "@/api/services/productService"
import apiClient from "axios"

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const loading = ref(false)
const saving = ref(false)
const product = ref<Partial<Product>>({})
const brands = ref<{ id: number; name: string }[]>([])

const previewImages = ref<string[]>([])

const fetchProduct = async () => {
  loading.value = true
  try {
    const { data } = await productService.get(id)
    product.value = data
    
    previewImages.value = data.images || []
  } catch (err) {
    console.error("Failed to load product", err)
  } finally {
    loading.value = false
  }
}

const fetchBrands = async () => {
  try {
    const res = await apiClient.get("/brands")
    brands.value = res.data.data
  } catch (err) {
    console.error("Failed to load brands", err)
  }
}

const selectedBrand = computed({
  get: () => product.value.brand_id ? Number(product.value.brand_id) : null,
  set: (val: number) => {
    product.value.brand_id = val
  }
})

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return

  for (const file of target.files) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      previewImages.value.push(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("image", file)
    try {
      const res = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (!product.value.images) product.value.images = []
      product.value.images.push(res.data.url)
    } catch (err) {
      console.error("Upload failed", err)
    }
  }
}

const removeImage = (index: number) => {
  previewImages.value.splice(index, 1)
  if (product.value.images) {
    product.value.images.splice(index, 1)
  }
}

const saveProduct = async () => {
  saving.value = true
  try {
    await productService.update(id, product.value)
    router.push("/admin/pages/products")
  } catch (err) {
    console.error("Failed to save product", err)
  } finally {
    saving.value = false
  }
}

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Deactived", value: "Deactived" }
]

onMounted(() => {
  fetchProduct()
  fetchBrands()
})

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Products", disabled: false, href: "/admin/pages/products" },
  { title: product.value?.name || "Detail", disabled: true, href: "#" }
])
</script>

<template>
  <BaseBreadcrumb :title="product.name" :breadcrumbs="breadcrumbs" />

  <v-row>
    <!-- Main Form -->
    <v-col cols="8">
      <UiParentCard :title="product.name || 'Detail Product'">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="5" />
        </template>

        <template v-else>
          <v-row>
            <!-- Name -->
            <v-col cols="12">
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <v-text-field v-model="product.name" variant="outlined" density="compact" hide-details />
            </v-col>

            <!-- Slug -->
            <v-col cols="12">
              <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <v-text-field v-model="product.slug" variant="outlined" density="compact" hide-details />
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <v-textarea v-model="product.description" variant="outlined" rows="4" density="compact" />
            </v-col>

            <!-- Price -->
            <v-col cols="6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <v-text-field v-model="product.price" type="number" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
              <v-text-field v-model="product.compare_price" type="number" variant="outlined" density="compact" />
            </v-col>

            <!-- SEO -->
            <v-col cols="12">
              <h3 class="font-semibold">SEO Settings</h3>
            </v-col>
            <v-col cols="12">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <v-text-field v-model="product.meta_title" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12">
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <v-textarea v-model="product.meta_description" variant="outlined" rows="2" density="compact" />
            </v-col>

            <!-- Save / Cancel -->
            <v-col cols="12" class="flex gap-3">
              <v-btn color="primary" @click="saveProduct" :loading="saving">Save</v-btn>
              <v-btn color="secondary" @click="router.push('/admin/pages/products')">Cancel</v-btn>
            </v-col>
          </v-row>
        </template>
      </UiParentCard>
    </v-col>

    <!-- Sidebar -->
    <v-col cols="4">
      <!-- Status -->
      <UiParentCard title="Publish" class="mb-3">
        <template v-if="loading">
          <SkeletonLoader type="card" :rows="5" />
        </template>
        <v-select
          v-model="product.status"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
        />
      </UiParentCard>

      <!-- Brand -->
      <UiParentCard title="Brand" class="mb-3">
        <v-select
          v-model="selectedBrand"
          :items="brands"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="compact"
        />
      </UiParentCard>

      <!-- Images -->
      <UiParentCard title="Product Images">
        <v-row>
          <v-col cols="12" v-for="(img, idx) in previewImages" :key="idx">
            <div class="relative">
              <img :src="img" class="shadow-md rounded-xl w-full sm:w-64 feature-img-product" />
              <v-btn color="error" size="x-small" class="absolute top-2 right-2" @click="removeImage(idx)">
                Remove
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12">
            <input type="file" multiple @change="handleImageUpload" />
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
