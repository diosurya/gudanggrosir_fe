<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
    <v-select
      v-model="selectedValue"
      :items="categories"
      item-title="name"
      item-value="id"
      variant="outlined"
      density="compact"
      :loading="loading"
    />
    
    <v-btn color="primary" @click="openAddDialog">
      Add Category
    </v-btn>

    <!-- Add Category Dialog -->
    <v-dialog v-model="addDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">Add New Category</v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.name"
                  label="Category Name"
                  variant="outlined"
                  density="compact"
                  :error-messages="errors.name"
                  @input="clearError('name')"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.slug"
                  label="Slug"
                  variant="outlined"
                  density="compact"
                  :error-messages="errors.slug"
                  @input="clearError('slug')"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newCategory.description"
                  label="Description (Optional)"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" @click="closeAddDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="saveCategory" 
            :loading="saving"
            :disabled="!newCategory.name.trim()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import apiClient from '@/api/axios'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

interface Props {
  modelValue: number | null
  categories: Category[]
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'category-added', category: Category): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const addDialog = ref(false)
const saving = ref(false)
const newCategory = ref({
  name: '',
  slug: '',
  description: ''
})

const errors = ref<Record<string, string[]>>({
  name: [],
  slug: []
})

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value: number | null) => emit('update:modelValue', value)
})

// Auto generate slug from name
watch(() => newCategory.value.name, (newName) => {
  if (newName && !newCategory.value.slug) {
    newCategory.value.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

const openAddDialog = () => {
  addDialog.value = true
}

const closeAddDialog = () => {
  addDialog.value = false
  resetForm()
}

const resetForm = () => {
  newCategory.value = {
    name: '',
    slug: '',
    description: ''
  }
  errors.value = {
    name: [],
    slug: []
  }
}

const clearError = (field: string) => {
  if (errors.value[field]) {
    errors.value[field] = []
  }
}

const saveCategory = async () => {
  // Reset errors
  errors.value = { name: [], slug: [] }
  
  // Basic validation
  if (!newCategory.value.name.trim()) {
    errors.value.name = ['Category name is required']
    return
  }

  if (!newCategory.value.slug.trim()) {
    errors.value.slug = ['Slug is required']
    return
  }

  saving.value = true
  try {
    const payload = {
      name: newCategory.value.name.trim(),
      slug: newCategory.value.slug.trim(),
      description: newCategory.value.description?.trim() || null
    }

    const response = await apiClient.post('/categories', payload)
    const savedCategory = response.data.data || response.data
    
    // Emit event to parent to refresh categories list
    emit('category-added', savedCategory)
    
    // Auto-select the newly created category
    emit('update:modelValue', savedCategory.id)
    
    closeAddDialog()
    
    // Show success message (you can customize this based on your notification system)
    console.log('Category added successfully!')
    
  } catch (error: any) {
    console.error('Failed to save category:', error)
    
    // Handle validation errors from server
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else if (error.response?.data?.message) {
      // Handle general error message
      errors.value.name = [error.response.data.message]
    } else {
      errors.value.name = ['Failed to save category. Please try again.']
    }
  } finally {
    saving.value = false
  }
}
</script>