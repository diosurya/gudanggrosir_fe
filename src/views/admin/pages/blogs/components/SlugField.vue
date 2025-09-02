<script setup lang="ts">
import { ref, watch, computed } from "vue"
import apiClient from "@/api/axios"

interface Props {
  modelValue?: string | null
  title?: string | null
  isEditMode: boolean
  originalSlug?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const slugChecking = ref(false)
const slugAvailable = ref<boolean | null>(null)

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Function to generate slug from title
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Function to check slug availability
const checkSlugAvailability = async (slug: string) => {
  if (!slug || slug.length < 3) {
    slugAvailable.value = null
    return
  }

  // In edit mode, don't check if slug is the same as original
  if (props.isEditMode && slug === props.originalSlug) {
    slugAvailable.value = true
    return
  }

  slugChecking.value = true
  try {
    const response = await apiClient.get(`/blogs/check-slug/${slug}`)
    slugAvailable.value = response.data.available
  } catch (error) {
    console.error('Error checking slug:', error)
    slugAvailable.value = null
  } finally {
    slugChecking.value = false
  }
}

// Debounced slug check
const debouncedSlugCheck = debounce(checkSlugAvailability, 500)

// Local slug value
const localSlug = computed({
  get: () => props.modelValue || '',
  set: (value: string) => {
    emit('update:modelValue', value)
  }
})

// Watch title changes to auto-generate slug (only for new blogs)
watch(() => props.title, (newTitle) => {
  if (newTitle && !props.isEditMode && !localSlug.value) {
    const generatedSlug = generateSlug(newTitle)
    localSlug.value = generatedSlug
  }
}, { immediate: false })

// Watch slug changes to check availability
watch(() => localSlug.value, (newSlug) => {
  if (newSlug && newSlug.length >= 3) {
    debouncedSlugCheck(newSlug)
  } else {
    slugAvailable.value = null
  }
}, { immediate: true })

// Generate new slug manually
const regenerateSlug = () => {
  if (props.title) {
    localSlug.value = generateSlug(props.title)
  }
}

// Computed color based on availability
const fieldColor = computed(() => {
  if (slugAvailable.value === true) return 'success'
  if (slugAvailable.value === false) return 'error'
  return 'primary'
})
</script>

<template>
  <div>
    <label class="text-sm font-medium text-gray-700  block">Slug</label>
    <div class="d-flex gap-2 align-center">
      <v-text-field 
        v-model="localSlug"
        variant="outlined" 
        density="compact" 
        :loading="slugChecking"
        :color="fieldColor"
        placeholder="auto-generated-from-title"
        hide-details
        class="flex-grow-1"
      />

      <v-btn 
        color="secondary" 
        class="ms-2"
        @click="regenerateSlug"
        :disabled="!title"
        variant="outlined"
      >
        Regenerate
      </v-btn>
    </div>
    
   <div v-if="slugAvailable !== null">
    <v-chip 
      size="small" 
      variant="text" 
      :class="slugAvailable ? 'text-success' : 'text-error'"
    >
      {{ slugAvailable ? 'Slug available' : 'Slug already exists' }}
    </v-chip>
  </div>
  </div>  
</template>