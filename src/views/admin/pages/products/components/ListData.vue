<script setup lang="ts">
    import { ref, watch, onMounted } from "vue"
    import { useRouter } from "vue-router"
    import UiTitleCard from "@/components/shared/UiTitleCard.vue"
    import SkeletonLoader from "@/components/shared/SkeletonLoader.vue"
    import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue"
    import { productService, type Product } from "@/api/services/productService"

    const products = ref<Product[]>([])
    const total = ref(0)
    const page = ref(1)
    const perPage = ref(10)
    const loading = ref(false)
    const searchQuery = ref("")
    const confirmDialog = ref(false)
    const selectedProduct = ref<Product | null>(null)

    const router = useRouter()

    const fetchProducts = async () => {
    loading.value = true
    try {
        const { data } = await productService.getAll({
        page: page.value,
        per_page: perPage.value,
        search: searchQuery.value || undefined,
        })

        products.value = data.data
        total.value = data.total
        perPage.value = data.per_page
    } catch (err) {
        console.error("Failed to fetch products:", err)
    } finally {
        loading.value = false
    }
    }

    const handleEdit = (id: number) => {
    router.push(`/admin/ecommerce/products/${id}`)
    }

    const handleDelete = (product: Product) => {
    selectedProduct.value = product
    confirmDialog.value = true
    }

    const confirmDelete = async () => {
    if (!selectedProduct.value) return
    loading.value = true
    try {
        await productService.delete(selectedProduct.value.id)
        await fetchProducts()
    } catch (err) {
        console.error("Failed to delete product:", err)
    } finally {
        confirmDialog.value = false
        loading.value = false
    }
    }

    onMounted(fetchProducts)
    watch([page, searchQuery], fetchProducts)
</script>

<template>
  <UiTitleCard title="Products" class-name="px-0 pb-0 rounded-md">
    <div v-if="loading" class="p-4">
      <SkeletonLoader :rows="5" />
    </div>

    <v-table v-else class="bordered-table" hover density="comfortable">
      <thead class="bg-containerBg">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Slug</th>
          <th>Price</th>
          <th>Quantity</th>
          <th class="w-40">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.slug }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.quantity }}</td>
          <td class="flex gap-2">
            <v-btn size="small" class="mr-1" color="primary" @click="handleEdit(product.id)">
              <EditOutlined class="mr-1" />
            </v-btn>
            <v-btn size="small" class="mr-1" color="error" variant="outlined" @click="handleDelete(product)">
              <DeleteOutlined class="mr-1" />
            </v-btn>
          </td>
        </tr>
        <tr v-if="!products.length">
          <td colspan="6" class="text-center py-4">No data found</td>
        </tr>
      </tbody>
    </v-table>

    <div class="flex justify-center py-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(total / perPage)"
        total-visible="7"
        color="primary"
      />
    </div>

    <v-dialog v-model="confirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-lg font-semibold">Confirm Delete</v-card-title>
        <v-card-text>Are you sure you want to delete ?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Yes, Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiTitleCard>
</template>