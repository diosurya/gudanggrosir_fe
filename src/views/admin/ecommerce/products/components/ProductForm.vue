<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { productService, type Product } from "@/api/services/productService"
import { brandService } from "@/api/services/brandService"
import { categoryProductService } from "@/api/services/categoryService"
import { tagService } from "@/api/services/tagService"

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id !== undefined

const loading = ref(false)
const brands = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])

const form = reactive<Partial<Product>>({
  name: "",
  slug: "",
  description: "",
  short_description: "",
  sku: "",
  barcode: "",
  price: 0,
  compare_price: 0,
  cost_price: 0,
  track_quantity: true,
  quantity: 0,
  min_quantity: 0,
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  status: "Draft",
  is_featured: false,
  is_digital: false,
  requires_shipping: true,
  taxable: true,
  sort_order: 0,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  focus_keyword: "",
  seo_score: 0,
  readability_score: 0,
  brand_id: undefined,
})

const images = ref<File[]>([]) // multiple images

const handleImageUpload = (files: File[] | undefined) => {
  if (files) {
    images.value = files
  }
}

const fetchOptions = async () => {
  const [b, c, t] = await Promise.all([
    brandService.getAll(),
    categoryProductService.getAll(),
    tagService.getAll(),
  ])
  brands.value = b.data.data || b.data
  categories.value = c.data.data || c.data
  tags.value = t.data.data || t.data
}

const fetchProduct = async () => {
  if (!isEdit) return
  loading.value = true
  try {
    const { data } = await productService.get(Number(route.params.id))
    Object.assign(form, data)
    // kalau API sudah return images, bisa ditampilkan di preview
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    for (const key in form) {
      if (form[key as keyof Product] !== undefined) {
        formData.append(key, String(form[key as keyof Product] ?? ""))
      }
    }

    // multiple images
    images.value.forEach((file) => {
      formData.append("images[]", file)
    })

    if (isEdit) {
      await productService.update(Number(route.params.id), formData)
    } else {
      await productService.create(formData)
    }
    router.push("/admin/pages/products")
  } catch (err) {
    console.error("Failed to save product:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOptions()
  fetchProduct()
})
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field v-model="form.name" label="Product Name" outlined dense />
    <v-text-field v-model="form.slug" label="Slug" outlined dense />
    <v-textarea v-model="form.short_description" label="Short Description" outlined dense />
    <v-textarea v-model="form.description" label="Description" outlined dense />
    <v-text-field v-model="form.sku" label="SKU" outlined dense />
    <v-text-field v-model="form.barcode" label="Barcode" outlined dense />

    <v-text-field v-model.number="form.price" type="number" label="Price" outlined dense />
    <v-text-field v-model.number="form.compare_price" type="number" label="Compare Price" outlined dense />
    <v-text-field v-model.number="form.cost_price" type="number" label="Cost Price" outlined dense />

    <v-text-field v-model.number="form.quantity" type="number" label="Quantity" outlined dense />
    <v-text-field v-model.number="form.min_quantity" type="number" label="Min Quantity" outlined dense />

    <v-select
      v-model="form.brand_id"
      :items="brands"
      item-value="id"
      item-title="name"
      label="Brand"
      outlined
      dense
    />

    <!-- multiple images -->
    <v-file-input
      multiple
      show-size
      accept="image/*"
      label="Upload Product Images"
      prepend-icon="mdi-image"
      @update:model-value="handleImageUpload"
    />

    <!-- preview uploaded images -->
    <div class="d-flex flex-wrap mt-4 gap-2">
      <v-img
        v-for="(file, idx) in images"
        :key="idx"
        :src="URL.createObjectURL(file)"
        width="120"
        height="120"
        cover
        class="rounded"
      />
    </div>

    <v-btn :loading="loading" type="submit" color="primary" class="mt-6">
      {{ isEdit ? "Update" : "Create" }} Product
    </v-btn>
  </v-form>
</template>
