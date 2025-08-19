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
  image_url: null as string | null,
  images: [] as Array<{ image_url: string; alt_text?: string }>
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

// Multiple images upload
const productImages = ref<Array<{ preview: string; image_url: string; alt_text?: string }>>([])
const uploadingImages = ref(false)

const handleMultipleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  uploadingImages.value = true
  const files = Array.from(target.files)
  
  try {
    for (const file of files) {
      // Create preview
      const reader = new FileReader()
      reader.onload = (ev) => {
        const preview = ev.target?.result as string
        
        // Upload file
        const formData = new FormData()
        formData.append("image", file)
        
        apiClient.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        }).then(res => {
          productImages.value.push({
            preview,
            image_url: res.data.url,
            alt_text: file.name
          })
        }).catch(err => {
          console.error("Upload failed", err)
        })
      }
      reader.readAsDataURL(file)
    }
  } catch (err) {
    console.error("Multiple upload failed", err)
  } finally {
    uploadingImages.value = false
  }
}

const removeProductImage = (index: number) => {
  productImages.value.splice(index, 1)
}

const resetAllImages = () => {
  productImages.value = []
}

const resetImage = () => {
  previewSrc.value = null
  product.value.image_url = null
}

const saveProduct = async () => {
  saving.value = true
  try {
    // Set images data
    product.value.images = productImages.value.map(img => ({
      image_url: img.image_url,
      alt_text: img.alt_text
    }))
    
    await productService.create(product.value)
    router.push("/admin/ecommerce/products")
  } catch (err) {
    console.error("Failed to save product", err)
  } finally {
    saving.value = false
  }
}

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Products", disabled: false, href: "/admin/ecommerce/products" },
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

          <!-- Product Images Section -->
          <v-col cols="12" class="mb-4">
            <h3 class="font-semibold mb-3">Images</h3>
            
            <!-- Image Preview Grid - Style seperti screenshot -->
            <div v-if="productImages.length > 0" class="image-grid mb-4">
              <div 
                v-for="(image, index) in productImages" 
                :key="index"
                class="image-item"
              >
                <div class="image-wrapper">
                  <img 
                    :src="image.preview" 
                    :alt="image.alt_text"
                    class="product-image"
                  />
                  <div class="image-overlay">
                    <v-btn
                      @click="removeProductImage(index)"
                      icon="mdi-close"
                      size="small"
                      color="error"
                      class="remove-btn"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload Controls -->
            <div class="upload-section">
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleMultipleImageUpload"
                class="hidden"
                ref="imageInput"
                id="productImages"
              />
              
              <div class="upload-controls">
                <label
                  for="productImages"
                  class="add-images-btn"
                  :class="{ 'loading': uploadingImages }"
                >
                  <v-icon left>mdi-plus</v-icon>
                  <span v-if="uploadingImages">Uploading...</span>
                  <span v-else>Add Images</span>
                </label>
                
                <v-btn
                  v-if="productImages.length > 0"
                  color="error"
                  variant="text"
                  size="small"
                  @click="resetAllImages"
                >
                  Reset
                </v-btn>
              </div>
              
              <div class="upload-info">
                <span class="image-count">{{ productImages.length }} image(s) selected</span>
              </div>
            </div>
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
          <v-col cols="12">
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
      <UiParentCard title="Cover Product">
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

<style scoped>
/* Image Grid Styling - Similar to screenshot */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(244, 67, 54, 0.9) !important;
}

/* Upload Section */
.upload-section {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #f9fafb;
}

.upload-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.add-images-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-images-btn:hover:not(.loading) {
  background: #1565c0;
}

.add-images-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-info {
  color: #6b7280;
  font-size: 14px;
}

.image-count {
  font-weight: 500;
}

.hidden {
  display: none;
}
</style>