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
}

/* Customize Quill to match Vuetify */
:deep(.ql-toolbar) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: rgb(var(--v-theme-surface));
}

:deep(.ql-container) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 0 0 4px 4px;
  font-family: inherit;
  background: rgb(var(--v-theme-surface));
}

:deep(.ql-editor) {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
}

:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: rgba(var(--v-theme-on-surface), 0.6);
  left: 15px;
  right: 15px;
}

/* Focus styles to match Vuetify */
.quill-wrapper:focus-within :deep(.ql-toolbar),
.quill-wrapper:focus-within :deep(.ql-container) {
  border-color: rgb(var(--v-theme-primary));
}

.quill-wrapper:focus-within :deep(.ql-container) {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

/* Disabled state */
:deep(.ql-container.ql-disabled) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

:deep(.ql-toolbar.ql-disabled) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

/* Dark theme adjustments */
:deep(.v-theme--dark .ql-snow .ql-stroke) {
  stroke: rgba(var(--v-theme-on-surface), 0.7);
}

:deep(.v-theme--dark .ql-snow .ql-fill) {
  fill: rgba(var(--v-theme-on-surface), 0.7);
}

:deep(.v-theme--dark .ql-snow .ql-picker) {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Custom button hover effects */
:deep(.ql-toolbar .ql-formats .ql-picker-label:hover),
:deep(.ql-toolbar .ql-formats button:hover) {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 3px;
}
</style>