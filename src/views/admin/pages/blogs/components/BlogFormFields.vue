<script setup lang="ts">
import { ref, computed, watch } from "vue"
import QuillEditorWrapper from "@/components/forms/QuillEditorWrapper.vue"
import SlugField from "./SlugField.vue"
import { type Blog } from "@/api/services/blogService"

interface Props {
  blog: Partial<Blog>
  isEditMode: boolean
  saving: boolean
}

interface Emits {
  (e: 'update:blog', updates: Partial<Blog>): void
  (e: 'save'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local refs for form fields
const formData = ref({ ...props.blog })

// Quill editor refs
const editorRef = ref<any>(null)
const editorReady = ref(false)

// Watch for prop changes and update local formData
watch(() => props.blog, (newBlog) => {
  formData.value = { ...newBlog }
}, { deep: true })

// Update parent when local data changes
const updateField = (field: keyof Blog, value: any) => {
  formData.value[field] = value
  emit('update:blog', { [field]: value })
}

// Handle Quill ready event
const onEditorReady = (editor: any) => {
  editorRef.value = editor
  editorReady.value = true
  console.log('Quill editor is ready!', editor)
}

// Handle Quill content change
const onEditorChange = (content: string) => {
  updateField('content', content)
}

// Blog content computed property for Quill
const blogContent = computed({
  get: () => formData.value.content || "",
  set: (val: string) => {
    updateField('content', val)
  }
})

// Handle form submission
const handleSave = () => {
  emit('save')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <v-form @submit.prevent="handleSave">
    <v-row>
      <!-- Title -->
      <v-col cols="12" class="pb-2">
        <v-text-field 
          :model-value="formData.title"
          @update:model-value="updateField('title', $event)"
          label="Title"
          variant="outlined" 
          density="compact" 
          :rules="[v => !!v || 'Title is required']"
          placeholder="Enter blog title"
          required
        />
      </v-col>

      <!-- Slug -->
      <v-col cols="12" class="pb-2">
        <SlugField
          :model-value="formData.slug"
          :title="formData.title"
          :is-edit-mode="isEditMode"
          :original-slug="blog.slug"
          @update:model-value="updateField('slug', $event)"
        />
      </v-col>

      <!-- Excerpt -->
      <v-col cols="12" class="pb-2">
        <v-textarea 
          :model-value="formData.excerpt"
          @update:model-value="updateField('excerpt', $event)"
          label="Excerpt"
          variant="outlined" 
          rows="3" 
          density="compact" 
          placeholder="Brief description of the blog post"
        />
      </v-col>

      <!-- Content with Quill Editor -->
      <v-col cols="12" class="pb-4">
        <h3 class="text-gray-700 mb-3 block">Content</h3>
        <QuillEditorWrapper
          v-model="blogContent"
          @ready="onEditorReady"
          @change="onEditorChange"
          placeholder="Write your blog content here..."
        />
      </v-col>

      <!-- SEO Settings -->
      <v-col cols="12">
        <h3 class="text-lg font-semibold">SEO Settings</h3>
      </v-col>

      <v-col cols="12">
        <v-text-field 
          :model-value="formData.seo_title"
          @update:model-value="updateField('seo_title', $event)"
          label="SEO Title"
          variant="outlined" 
          density="compact" 
          placeholder="SEO optimized title"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea 
          :model-value="formData.seo_keywords"
          @update:model-value="updateField('seo_keywords', $event)"
          label="SEO Keywords"
          variant="outlined" 
          rows="2" 
          density="compact" 
          placeholder="keyword1, keyword2, keyword3"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea 
          :model-value="formData.seo_description"
          @update:model-value="updateField('seo_description', $event)"
          label="SEO Description"
          variant="outlined" 
          rows="3" 
          density="compact" 
          placeholder="Meta description for search engines"
        />
      </v-col>

      <!-- Action Buttons -->
      <v-col cols="12" class="d-flex gap-3 mb-3">
        <v-btn 
          color="primary"
          class="me-2" 
          @click="handleSave"
          :loading="saving"
          :disabled="saving"
          type="submit"
        >
          {{ isEditMode ? 'Update' : 'Create' }}
        </v-btn>
        <v-btn 
          color="secondary" 
          variant="outlined"
          @click="handleCancel"
          :disabled="saving"
        >
          Cancel
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
/* Quill editor styling */
:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-container) {
  font-family: inherit;
}

/* Custom form styling */
.v-text-field :deep(.v-field__input) {
  min-height: 40px;
}

.v-textarea :deep(.v-field__input) {
  min-height: 60px;
}
</style>