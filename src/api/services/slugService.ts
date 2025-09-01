// composables/useSlug.ts
import { ref, watch } from 'vue'
import apiClient from '@/api/axios'

export interface SlugCheckResponse {
  success: boolean
  available: boolean
  slug: string
  message: string
}

export interface SlugGenerateResponse {
  success: boolean
  slug: string
  original_slug: string
  is_unique: boolean
}

export const useSlug = () => {
  const isChecking = ref(false)
  const isAvailable = ref<boolean | null>(null)
  const suggestions = ref<string[]>([])

  // Generate slug from text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Check if slug is available
  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!slug || slug.length < 3) {
      isAvailable.value = null
      return false
    }

    isChecking.value = true
    try {
      const response = await apiClient.get<SlugCheckResponse>(`/blogs/check-slug/${slug}`)
      isAvailable.value = response.data.available
      return response.data.available
    } catch (error) {
      console.error('Error checking slug:', error)
      isAvailable.value = null
      return false
    } finally {
      isChecking.value = false
    }
  }

  // Generate unique slug from title
  const generateUniqueSlug = async (title: string): Promise<string> => {
    if (!title) return ''

    try {
      const response = await apiClient.post<SlugGenerateResponse>('/blogs/generate-slug', {
        title
      })
      return response.data.slug
    } catch (error) {
      console.error('Error generating slug:', error)
      return generateSlug(title)
    }
  }

  // Get slug suggestions
  const getSlugSuggestions = async (title: string): Promise<string[]> => {
    if (!title) return []

    try {
      const response = await apiClient.post('/blogs/suggest-slugs', {
        title
      })
      suggestions.value = response.data.suggestions
      return response.data.suggestions
    } catch (error) {
      console.error('Error getting slug suggestions:', error)
      return []
    }
  }

  // Debounced slug checker
  const debouncedSlugCheck = useDebounceFn(checkSlugAvailability, 500)

  return {
    isChecking,
    isAvailable,
    suggestions,
    generateSlug,
    checkSlugAvailability,
    generateUniqueSlug,
    getSlugSuggestions,
    debouncedSlugCheck
  }
}

// Utility composable for debouncing
function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}