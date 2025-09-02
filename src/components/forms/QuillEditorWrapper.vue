<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { QuillEditor } from "@vueup/vue-quill"
import "@vueup/vue-quill/dist/vue-quill.snow.css"

interface Props {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  theme?: 'snow' | 'bubble'
}

interface Emits {
  (e: "update:modelValue", value: string): void
  (e: "ready", editor: any): void
  (e: "change", content: string): void
  (e: "textChange", delta: any, oldContents: any, source: string): void
  (e: "selectionChange", range: any, oldRange: any, source: string): void
  (e: "focus", editor: any): void
  (e: "blur", editor: any): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: "Write your content here...",
  theme: "snow"
})

const emit = defineEmits<Emits>()

const quillRef = ref<any>(null)

// Create a local reactive content variable
const localContent = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localContent.value) {
    localContent.value = newValue
  }
})

// Computed property for two-way binding with QuillEditor
const editorContent = computed({
  get: () => localContent.value,
  set: (value: string) => {
    localContent.value = value
    emit('update:modelValue', value)
    emit('change', value)
  }
})

// Quill options sesuai dokumentasi VueUp
const quillOptions = ref({
  debug: 'info',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }, { align: [] }],
      ['link', 'image', 'video', 'formula'],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  },
  placeholder: props.placeholder,
  readOnly: props.disabled,
  theme: props.theme
})

// Handle ready event
const onReady = (quill: any) => {
  console.log('Quill editor ready:', quill)
  emit('ready', quill)
}

// Handle Quill text change event
const onQuillTextChange = (delta: any, oldContents: any, source: string) => {
  emit('textChange', delta, oldContents, source)
}

// Handle selection change
const onSelectionChange = (range: any, oldRange: any, source: string) => {
  emit('selectionChange', range, oldRange, source)
}

// Handle focus
const onFocus = (quill: any) => {
  emit('focus', quill)
}

// Handle blur
const onBlur = (quill: any) => {
  emit('blur', quill)
}

// Watch disabled prop
watch(() => props.disabled, (disabled) => {
  if (quillRef.value) {
    quillRef.value.enable(!disabled)
  }
})

// Watch placeholder prop
watch(() => props.placeholder, (placeholder) => {
  if (quillOptions.value) {
    quillOptions.value.placeholder = placeholder
  }
})

// Get editor instance
const getQuill = () => {
  return quillRef.value?.getQuill()
}

// Get HTML content
const getHTML = () => {
  return quillRef.value?.getHTML()
}

// Get text content
const getText = () => {
  return quillRef.value?.getText()
}

// Set content
const setContent = (content: string) => {
  if (quillRef.value) {
    quillRef.value.setHTML(content)
  }
}

// Expose methods to parent component
defineExpose({
  getQuill,
  getHTML,
  getText,
  setContent
})
</script>

<template>
  <div class="quill-wrapper">
    <QuillEditor
      ref="quillRef"
      v-model:content="editorContent"
      :options="quillOptions"
      content-type="html"
      @ready="onReady"
      @textChange="onQuillTextChange"
      @selectionChange="onSelectionChange"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.quill-wrapper {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background-color: white;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Toolbar */
:deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 0 0;
  background: #f9f9f9;
  padding: 8px;
}

/* Editor container */
:deep(.ql-container) {
  border: none;
  border-radius: 0 0 8px 8px;
  min-height: 300px;
  max-height: 600px;
  background-color: white;
  padding: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  overflow-y: auto;
}

/* Placeholder */
:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: #bbb;
  left: 16px;
}

/* Focus ring */
.quill-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Disabled state */
:deep(.ql-container.ql-disabled),
:deep(.ql-toolbar.ql-disabled) {
  background-color: #f5f5f5;
  opacity: 0.6;
  pointer-events: none;
}

/* Hover toolbar buttons */
:deep(.ql-toolbar .ql-formats button:hover),
:deep(.ql-toolbar .ql-picker-label:hover) {
  background-color: rgba(59, 130, 246, 0.08);
  border-radius: 4px;
}

/* Smooth transitions */
:deep(.ql-container),
:deep(.ql-toolbar),
.quill-wrapper {
  transition: all 0.2s ease;
}

/* global.css atau app.scss */
.elevated-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

</style>
