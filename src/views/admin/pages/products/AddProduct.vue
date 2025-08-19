<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import { productService } from "@/api/services/productService"
import apiClient from "@/api/axios"

const router = useRouter()
const saving = ref(false)

const product = ref({
  name: "",
  slug: "",
  description: "",
  short_description: "",
  sku: "",
  barcode: "",
  price: null as number | null,
  compare_price: null as number | null,
  cost_price: null as number | null,
  track_quantity: true,
  quantity: 0,
  min_quantity: 1,
  category_id: null as number | null,
  status: "Draft",
  seo_title: "",
  seo_keywords: "",
  seo_description: "",
  image_url: null as string | null
})

// kategori
const categories = ref<{ id: number; name: string }[]>([])
const fetchCategories = async () => {
  try {
    const res = await apiClient.get("/categories")
    categories.value = res.data.data
  } catch (err) {
    console.error("Failed to load categories", err)
  }
}

// preview image
const previewSrc = ref<string | null>(null)
const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]

  const reader = new FileReader()
  reader.onload = (ev) => {
    previewSrc.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)

  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    product.value.image_url = res.data.url
  } catch (err) {
    console.error("Upload failed", err)
  }
}

const resetImage = () => {
  previewSrc.value = null
  product.value.image_url = null
}

const saveProduct = async () => {
  saving.value = true
  try {
    await productService.create(product.value)
    router.push("/admin/pages/products")
  } catch (err) {
    console.error("Failed to save product", err)
  } finally {
    saving.value = false
  }
}

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Products", disabled: false, href: "/admin/pages/products" },
  { title: "Add Product", disabled: true, href: "#" }
])

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
  { label: "Deactived", value: "Deactived" }
]

fetchCategories()
</script>

<template>
  <BaseBreadcrumb title="Add Product" :breadcrumbs="breadcrumbs" />

  <v-row>
    <!-- Main Form -->
    <v-col cols="8">
      <UiParentCard title="Add New Product">
        <v-row>
          <!-- Name -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <v-text-field v-model="product.name" variant="outlined" density="compact" hide-details />
          </v-col>

          <!-- Slug -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <v-text-field v-model="product.slug" variant="outlined" density="compact" hide-details />
          </v-col>

          <!-- Short Description -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <v-textarea v-model="product.short_description" variant="outlined" rows="2" density="compact" />
          </v-col>

          <!-- Description -->
          <v-col cols="12" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <v-textarea v-model="product.description" rows="8" density="compact" />
          </v-col>

          <!-- Pricing -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold">Pricing</h3>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="product.price" type="number" label="Price" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="product.compare_price" type="number" label="Compare Price" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="product.cost_price" type="number" label="Cost Price" variant="outlined" density="compact" />
          </v-col>

          <!-- Inventory -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold">Inventory</h3>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="product.sku" label="SKU" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="product.barcode" label="Barcode" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="6">
            <v-switch v-model="product.track_quantity" label="Track Quantity" density="compact" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="product.quantity" type="number" label="Quantity" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="product.min_quantity" type="number" label="Min Quantity" variant="outlined" density="compact" />
          </v-col>

          <!-- SEO -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold">SEO Settings</h3>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="product.seo_title" label="SEO Title" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="product.seo_keywords" label="SEO Keywords" rows="2" variant="outlined" density="compact" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="product.seo_description" label="SEO Description" rows="2" variant="outlined" density="compact" />
          </v-col>

          <!-- Save -->
          <v-col cols="12" class="flex gap-3">
            <v-btn class="mr-2" color="primary" @click="saveProduct" :loading="saving">Save</v-btn>
            <v-btn color="secondary" @click="router.push('/admin/pages/products')">Cancel</v-btn>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>

    <!-- Sidebar -->
    <v-col cols="4">
      <!-- Status -->
      <UiParentCard title="Publish" class="mb-3">
        <v-select
          :items="statusOptions"
          item-title="label"
          item-value="value"
          v-model="product.status"
          variant="outlined"
          density="compact"
        />
      </UiParentCard>

      <!-- Category -->
      <UiParentCard title="Category" class="mb-3">
        <v-select
          v-model="product.category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="compact"
        />
      </UiParentCard>

      <!-- Feature Image -->
      <UiParentCard title="Feature Image">
        <div class="flex flex-col items-center gap-4">
          <img
            v-if="previewSrc"
            :src="previewSrc"
            alt="Preview Image"
            class="shadow-md rounded-xl w-full sm:w-64 feature-img-product"
            style="filter: grayscale(100%)"
          />
          <input class="m-2 mb-2 btn btn-primary" type="file" @change="handleImageUpload" />
          <v-btn v-if="previewSrc" color="error" size="small" @click="resetImage">Remove</v-btn>
        </div>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
