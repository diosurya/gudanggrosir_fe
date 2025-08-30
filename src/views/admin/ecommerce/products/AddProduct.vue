<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue"
import UiParentCard from "@/components/shared/UiParentCard.vue"
import apiClient from "@/api/axios"

const router = useRouter()
const saving = ref(false)

const product = ref({
  name: "",
  description: "",
  short_description: "",
  sku: "",
  price: 0, // Changed from null to 0 to avoid validation issues
  sale_price: null as number | null,
  stock_quantity: 0,
  category_product_id: null as number | null,
  brand_id: null as number | null,
  weight: null as number | null,
  dimensions: "",
  status: "draft",
  featured: false,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_title: "",
  og_description: "",
  og_image: null as number | null,
  twitter_title: "",
  twitter_description: "",
  twitter_image: null as number | null,
  canonical_url: "",
  robots: "index",
  schema_type: "Product",
  tags: [] as number[],
  images: [] as number[],
  variants: [] as Array<{
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    images: number[];
  }>
})

// Categories
const categories = ref<{ id: number; name: string }[]>([])
const categoryDialog = ref(false)
const newCategory = ref({
  name: "",
  description: "",
  parent_id: null as number | null
})
const savingCategory = ref(false)

const fetchCategories = async () => {
  try {
    const res = await apiClient.get("/category_products")
    categories.value = res.data.data || res.data
  } catch (err) {
    console.error("Failed to load categories", err)
  }
}

const createCategory = async () => {
  savingCategory.value = true
  try {
    const response = await apiClient.post("/category_products", newCategory.value)
    if (response.data.status === 'success') {
      await fetchCategories()
      product.value.category_product_id = response.data.data.id
      categoryDialog.value = false
      resetNewCategory()
    }
  } catch (err) {
    console.error("Failed to create category", err)
  } finally {
    savingCategory.value = false
  }
}

const resetNewCategory = () => {
  newCategory.value = {
    name: "",
    description: "",
    parent_id: null
  }
}

// Brands
const brands = ref<{ id: number; name: string }[]>([])
const brandDialog = ref(false)
const newBrand = ref({
  name: "",
  description: "",
  logo_url: "",
  website_url: ""
})
const savingBrand = ref(false)

const fetchBrands = async () => {
  try {
    const res = await apiClient.get("/brands")
    brands.value = res.data.data || res.data
  } catch (err) {
    console.error("Failed to load brands", err)
  }
}

const createBrand = async () => {
  savingBrand.value = true
  try {
    const response = await apiClient.post("/brands", newBrand.value)
    if (response.data.status === 'success') {
      await fetchBrands()
      product.value.brand_id = response.data.data.id
      brandDialog.value = false
      resetNewBrand()
    }
  } catch (err) {
    console.error("Failed to create brand", err)
  } finally {
    savingBrand.value = false
  }
}

const resetNewBrand = () => {
  newBrand.value = {
    name: "",
    description: "",
    logo_url: "",
    website_url: ""
  }
}

// Tags
const tags = ref<{ id: number; name: string }[]>([])
const tagDialog = ref(false)
const newTag = ref({
  name: "",
  description: "",
  color: "#1976d2"
})
const savingTag = ref(false)

const fetchTags = async () => {
  try {
    const res = await apiClient.get("/tags")
    tags.value = res.data.data || res.data
  } catch (err) {
    console.error("Failed to load tags", err)
  }
}

const createTag = async () => {
  savingTag.value = true
  try {
    const response = await apiClient.post("/tags", newTag.value)
    if (response.data.status === 'success') {
      await fetchTags()
      if (!product.value.tags.includes(response.data.data.id)) {
        product.value.tags.push(response.data.data.id)
      }
      tagDialog.value = false
      resetNewTag()
    }
  } catch (err) {
    console.error("Failed to create tag", err)
  } finally {
    savingTag.value = false
  }
}

const resetNewTag = () => {
  newTag.value = {
    name: "",
    description: "",
    color: "#1976d2"
  }
}

// Feature image handling
const featureImage = ref<{ id: number; url: string } | null>(null)
const uploadingFeature = ref(false)

const handleFeatureImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  uploadingFeature.value = true
  const file = target.files[0]

  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "image")
    formData.append("collection", "products")

    const res = await apiClient.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    
    featureImage.value = {
      id: res.data.data.id,
      url: res.data.data.url
    }
    product.value.og_image = res.data.data.id
  } catch (err) {
    console.error("Feature image upload failed", err)
  } finally {
    uploadingFeature.value = false
  }
}

// Product images handling
const productImages = ref<Array<{ id: number; url: string; name: string }>>([])
const uploadingImages = ref(false)

const handleMultipleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  uploadingImages.value = true
  const files = Array.from(target.files)
  
  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")
      formData.append("collection", "products")
      
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      productImages.value.push({
        id: res.data.data.id,
        url: res.data.data.url,
        name: file.name
      })
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

const resetFeatureImage = () => {
  featureImage.value = null
  product.value.og_image = null
}

// Auto-generate slug from name
watch(() => product.value.name, (newName) => {
  if (newName) {
    // Simple slug generation (you might want to use a more robust solution)
    const slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
    // Note: The backend will handle slug uniqueness
  }
})

const saveProduct = async () => {
  saving.value = true
  try {
    // Prepare product data
    const productData = {
      ...product.value,
      images: productImages.value.map(img => img.id)
    }
    
    // Remove empty/null values but keep required fields
    Object.keys(productData).forEach(key => {
      if (productData[key] === null || productData[key] === '') {
        // Don't delete required fields, let backend validation handle them
        if (!['name', 'sku', 'price', 'stock_quantity', 'category_product_id', 'status'].includes(key)) {
          delete productData[key]
        }
      }
    })
    
    // Ensure canonical_url is either a valid URL or removed
    if (productData.canonical_url && !isValidUrl(productData.canonical_url)) {
      delete productData.canonical_url
    }
    
    console.log('Sending product data:', productData) // Debug log
    
    const response = await apiClient.post("/admin/products", productData)
    
    if (response.data.status === 'success') {
      router.push("/admin/ecommerce/products")
    }
  } catch (err) {
    console.error("Failed to save product", err)
    if (err.response?.data?.errors) {
      console.error("Validation errors:", err.response.data.errors)
    }
    // You might want to show an error message to the user here
  } finally {
    saving.value = false
  }
}

// Helper function to validate URL
const isValidUrl = (string: string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const breadcrumbs = computed(() => [
  { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
  { title: "Products", disabled: false, href: "/admin/ecommerce/products" },
  { title: "Add Product", disabled: true, href: "#" }
])

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" }
]

const robotsOptions = [
  { label: "Index, Follow", value: "index" },
  { label: "No Index, No Follow", value: "noindex nofollow" },
  { label: "Index, No Follow", value: "index nofollow" },
  { label: "No Index, Follow", value: "noindex follow" }
]

const schemaTypeOptions = [
  { label: "Product", value: "Product" },
  { label: "Variation Product", value: "VariationProduct" }
]

// Load initial data
fetchCategories()
fetchBrands()
fetchTags()
</script>

<template>
  <BaseBreadcrumb title="Add Product" :breadcrumbs="breadcrumbs" />

  <v-row>
    <!-- Main Form -->
    <v-col cols="8">
      <UiParentCard title="Add New Product">
        <v-row>
          <!-- Basic Information -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold mb-3">Basic Information</h3>
          </v-col>
          
          <!-- Name -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <v-text-field 
              v-model="product.name" 
              variant="outlined" 
              density="compact" 
              hide-details
              required
            />
          </v-col>

          <!-- SKU -->
          <v-col cols="6" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <v-text-field 
              v-model="product.sku" 
              variant="outlined" 
              density="compact" 
              hide-details
              required
            />
          </v-col>

          <!-- Weight -->
          <v-col cols="6" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <v-text-field 
              v-model="product.weight" 
              type="number" 
              variant="outlined" 
              density="compact" 
              hide-details
              step="0.01"
            />
          </v-col>

          <!-- Dimensions -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Dimensions (L x W x H)</label>
            <v-text-field 
              v-model="product.dimensions" 
              variant="outlined" 
              density="compact" 
              hide-details
              placeholder="e.g., 10 x 5 x 3 cm"
            />
          </v-col>

          <!-- Short Description -->
          <v-col cols="12" class="mb-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <v-textarea 
              v-model="product.short_description" 
              variant="outlined" 
              rows="2" 
              density="compact"
              counter="500"
              maxlength="500"
            />
          </v-col>

          <!-- Description -->
          <v-col cols="12" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <v-textarea 
              v-model="product.description" 
              rows="8" 
              density="compact"
              variant="outlined"
            />
          </v-col>

          <!-- Product Images Section -->
          <v-col cols="12" class="mb-4">
            <h3 class="font-semibold mb-3">Product Images</h3>
            
            <!-- Image Preview Grid -->
            <div v-if="productImages.length > 0" class="image-grid mb-4">
              <div 
                v-for="(image, index) in productImages" 
                :key="index"
                class="image-item"
              >
                <div class="image-wrapper">
                  <img 
                    :src="image.url" 
                    :alt="image.name"
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
            <h3 class="font-semibold mb-3">Pricing</h3>
          </v-col>
          <!-- Regular Price -->
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Regular Price *</label>
            <v-text-field 
              v-model.number="product.price" 
              type="number" 
              variant="outlined" 
              density="compact"
              step="0.01"
              min="0"
              required
              :error="!product.price"
              :error-messages="!product.price ? 'Price is required' : ''"
            />
          </v-col>
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
            <v-text-field 
              v-model.number="product.sale_price" 
              type="number" 
              variant="outlined" 
              density="compact"
              step="0.01"
              min="0"
            />
          </v-col>

          <!-- Inventory -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold mb-3">Inventory</h3>
          </v-col>
          <v-col cols="12" class="mb-2">
            <v-switch 
              v-model="product.featured" 
              label="Featured Product" 
              density="compact"
              color="primary"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <v-text-field 
              v-model="product.stock_quantity" 
              type="number" 
              variant="outlined" 
              density="compact"
              min="0"
              required
            />
          </v-col>

          <!-- SEO Settings -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold mb-3">SEO Settings</h3>
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <v-text-field 
              v-model="product.meta_title" 
              variant="outlined" 
              density="compact"
              counter="60"
              maxlength="60"
              hint="Optimal length: 50-60 characters"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <v-textarea 
              v-model="product.meta_description" 
              rows="3" 
              variant="outlined" 
              density="compact"
              counter="160"
              maxlength="160"
              hint="Optimal length: 150-160 characters"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
            <v-text-field 
              v-model="product.meta_keywords" 
              variant="outlined" 
              density="compact"
              hint="Separate keywords with commas"
            />
          </v-col>

          <!-- Open Graph Settings -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold mb-3">Open Graph Settings</h3>
          </v-col>
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
            <v-text-field 
              v-model="product.og_title" 
              variant="outlined" 
              density="compact"
            />
          </v-col>
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Title</label>
            <v-text-field 
              v-model="product.twitter_title" 
              variant="outlined" 
              density="compact"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
            <v-textarea 
              v-model="product.og_description" 
              rows="2" 
              variant="outlined" 
              density="compact"
            />
          </v-col>

          <!-- Advanced Settings -->
          <v-col cols="12" class="mb-1">
            <h3 class="font-semibold mb-3">Advanced Settings</h3>
          </v-col>
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Robots</label>
            <v-select
              v-model="product.robots"
              :items="robotsOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Schema Type</label>
            <v-select
              v-model="product.schema_type"
              :items="schemaTypeOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
            <v-text-field 
              v-model="product.canonical_url" 
              variant="outlined" 
              density="compact"
              placeholder="https://example.com/product-name"
              :error="product.canonical_url && !isValidUrl(product.canonical_url)"
              :error-messages="product.canonical_url && !isValidUrl(product.canonical_url) ? 'Please enter a valid URL' : ''"
              hint="Leave empty if not needed, or enter a full URL starting with http:// or https://"
            />
          </v-col>

          <!-- Save Actions -->
          <v-col cols="12" class="flex gap-3 pt-6">
            <v-btn 
              color="primary" 
              @click="saveProduct" 
              :loading="saving"
              size="large"
            >
              <v-icon left>mdi-content-save</v-icon>
              Save Product
            </v-btn>
            <v-btn 
              color="secondary" 
              variant="outlined"
              @click="router.push('/admin/ecommerce/products')"
              size="large"
            >
              Cancel
            </v-btn>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>

    <!-- Sidebar -->
    <v-col cols="4">
      <!-- Status -->
      <UiParentCard title="Publish Status" class="mb-3">
        <v-select
          v-model="product.status"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
        />
      </UiParentCard>

      <!-- Category -->
      <UiParentCard title="Product Category *" class="mb-3">
        <div class="d-flex align-center gap-2 mb-2">
          <v-select
            v-model="product.category_product_id"
            :items="categories"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            required
            :error="!product.category_product_id"
            :error-messages="!product.category_product_id ? 'Category is required' : ''"
            placeholder="Select a category"
            class="flex-grow-1"
          />
          <v-btn
            @click="categoryDialog = true"
            color="primary"
            icon="mdi-plus"
            size="small"
            variant="outlined"
          ></v-btn>
        </div>
      </UiParentCard>

      <!-- Brand -->
      <UiParentCard title="Brand" class="mb-3">
        <div class="d-flex align-center gap-2 mb-2">
          <v-select
            v-model="product.brand_id"
            :items="brands"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            clearable
            placeholder="Select a brand"
            class="flex-grow-1"
          />
          <v-btn
            @click="brandDialog = true"
            color="primary"
            icon="mdi-plus"
            size="small"
            variant="outlined"
          ></v-btn>
        </div>
      </UiParentCard>

      <!-- Tags -->
      <UiParentCard title="Tags" class="mb-3">
        <div class="d-flex align-center gap-2 mb-2">
          <v-select
            v-model="product.tags"
            :items="tags"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            placeholder="Select tags"
            class="flex-grow-1"
          />
          <v-btn
            @click="tagDialog = true"
            color="primary"
            icon="mdi-plus"
            size="small"
            variant="outlined"
          ></v-btn>
        </div>
      </UiParentCard>

      <!-- Feature Image -->
      <UiParentCard title="Featured Image">
        <div class="flex flex-col items-center gap-4">
          <img
            v-if="featureImage?.url"
            :src="featureImage.url"
            alt="Featured Image"
            class="shadow-md rounded-xl w-full feature-img-product"
          />
          <div v-else class="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
            <v-icon size="48" color="gray">mdi-image-outline</v-icon>
          </div>
          
          <input 
            type="file" 
            @change="handleFeatureImageUpload" 
            accept="image/*"
            class="hidden"
            ref="featureImageInput"
            id="featureImage"
          />
          
          <div class="flex gap-2">
            <label
              for="featureImage"
              class="v-btn v-btn--density-default v-btn--size-default v-btn--variant-flat"
              :class="{ 'v-btn--loading': uploadingFeature }"
            >
              <v-icon left>mdi-upload</v-icon>
              {{ featureImage ? 'Change' : 'Upload' }}
            </label>
            
            <v-btn 
              v-if="featureImage" 
              color="error" 
              size="small" 
              @click="resetFeatureImage"
              variant="outlined"
            >
              Remove
            </v-btn>
          </div>
        </div>
      </UiParentCard>
    </v-col>
  </v-row>

  <!-- Category Dialog -->
  <v-dialog v-model="categoryDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Add New Category</span>
        <v-btn icon="mdi-close" @click="categoryDialog = false" size="small"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <v-text-field
              v-model="newCategory.name"
              variant="outlined"
              density="compact"
              required
              placeholder="Enter category name"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <v-textarea
              v-model="newCategory.description"
              variant="outlined"
              density="compact"
              rows="3"
              placeholder="Enter category description (optional)"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <v-select
              v-model="newCategory.parent_id"
              :items="categories"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              clearable
              placeholder="Select parent category (optional)"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="categoryDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createCategory"
          :loading="savingCategory"
          :disabled="!newCategory.name"
        >
          Create Category
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Brand Dialog -->
  <v-dialog v-model="brandDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Add New Brand</span>
        <v-btn icon="mdi-close" @click="brandDialog = false" size="small"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
            <v-text-field
              v-model="newBrand.name"
              variant="outlined"
              density="compact"
              required
              placeholder="Enter brand name"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <v-textarea
              v-model="newBrand.description"
              variant="outlined"
              density="compact"
              rows="3"
              placeholder="Enter brand description (optional)"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <v-text-field
              v-model="newBrand.website_url"
              variant="outlined"
              density="compact"
              placeholder="https://brand-website.com (optional)"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <v-text-field
              v-model="newBrand.logo_url"
              variant="outlined"
              density="compact"
              placeholder="https://logo-url.com/logo.png (optional)"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="brandDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createBrand"
          :loading="savingBrand"
          :disabled="!newBrand.name"
        >
          Create Brand
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Tag Dialog -->
  <v-dialog v-model="tagDialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Add New Tag</span>
        <v-btn icon="mdi-close" @click="tagDialog = false" size="small"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tag Name *</label>
            <v-text-field
              v-model="newTag.name"
              variant="outlined"
              density="compact"
              required
              placeholder="Enter tag name"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <v-textarea
              v-model="newTag.description"
              variant="outlined"
              density="compact"
              rows="3"
              placeholder="Enter tag description (optional)"
            />
          </v-col>
          <v-col cols="12">
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div class="d-flex align-center gap-3">
              <input
                type="color"
                v-model="newTag.color"
                class="color-picker"
              />
              <v-text-field
                v-model="newTag.color"
                variant="outlined"
                density="compact"
                placeholder="#1976d2"
                class="flex-grow-1"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="tagDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createTag"
          :loading="savingTag"
          :disabled="!newTag.name"
        >
          Create Tag
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Image Grid Styling */
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
  text-decoration: none;
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

.feature-img-product {
  max-height: 300px;
  object-fit: cover;
}

/* Form styling improvements */
label {
  margin-bottom: 4px;
  font-weight: 500;
}

h3 {
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

/* Color picker styling */
.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Dialog styling improvements */
.v-dialog .v-card {
  border-radius: 8px;
}

.v-dialog .v-card-title {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

/* Flex utilities for dialogs */
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>